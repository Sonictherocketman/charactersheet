/*eslint no-console:0*/
import {
    CHAT_MESSAGE_TYPES,
    ChatServiceManager,
    KeyValuePredicate,
    OrPredicate,
    PersistenceService
} from 'charactersheet/services/common';
import {
    CharacterManager,
    Notifications
} from 'charactersheet/utilities';
import { ChatCellViewModel } from './chat_cell';
import { ChatRoom } from 'charactersheet/models';
import { MasterDetailViewModel } from 'charactersheet/viewmodels/common/master_detail';
import { XMPPService } from 'charactersheet/services/common/account';
import ko from 'knockout';
import template from './index.html';
import uuid from 'node-uuid';

export function ChatViewModel(params) {
    var self = new MasterDetailViewModel();

    self.chats = ko.observableArray();
    self.isActive = params.isActive;
    self.isConnectedToParty = ko.observable(false);

    self.title = 'Chats';
    self.shouldDisplayModelOnNewItem = true;

    /* View Model Methods */

    self.didLoad = () => {
        self._purgeChats();

        self.reloadCells();
        self.selectedCell(self.cells()[0]);
        self.checkForParty();

        // Message Notifications
        Notifications.chat.message.add(self._deliverMessageToRoom);
        Notifications.chat.room.add(self.reloadCells);
        Notifications.chat.member.joined.add(self._userHasJoinedOrLeft);
        Notifications.chat.member.left.add(self._userHasJoinedOrLeft);
        Notifications.party.joined.add(self._didJoinParty);
        Notifications.party.left.add(self._hasLeftParty);
        Notifications.party.players.changed.add(self.reloadCells);
    };

    self.didUnload = () => {

        // Message Notifications
        Notifications.chat.message.remove(self._deliverMessageToRoom);
        Notifications.chat.room.remove(self.reloadCells);
        Notifications.chat.member.joined.remove(self._userHasJoinedOrLeft);
        Notifications.chat.member.left.remove(self._userHasJoinedOrLeft);
        Notifications.party.joined.remove(self._didJoinParty);
        Notifications.party.left.remove(self._hasLeftParty);
        Notifications.party.players.changed.remove(self.reloadCells);
    };

    self.checkForParty = () => {
        var chat = ChatServiceManager.sharedService();
        self.isConnectedToParty(chat.currentPartyNode == null ? false : true);
    };

    /* List Management Methods */

    /**
     * Create a new chat and add it to the list. It should be auto selected.
     *
     * Note: New rooms are created with the following JID format:
     * <user's chosen room name>.<PARTY_ID>@<MUC_SERVICE>
     */
    self.addItem = (invitees) => {
        var name = uuid.v4().substring(0,6);
        if (invitees.length === 0) { return; }

        var chatService = ChatServiceManager.sharedService();
        var jid = name + '@' + MUC_SERVICE;
        var room = chatService.createRoomAndInvite(jid, invitees);

        self.reloadCells();

        var cellToSelect = self.cells().filter((cell, idx, _) => {
            return cell.id() === room.chatId();
        })[0];
        self.selectedCell(cellToSelect);
    };

    /**
     * Clear the detail view model and reload the list of chats.
     */
    self.deleteCell = (cell) => {
        var chatService = ChatServiceManager.sharedService();
        chatService.leave(cell.id(), 'test', console.log);

        var chat = PersistenceService.findFirstBy(ChatRoom, 'chatId', cell.id());
        if (chat) {
            chat.purge();
            chat.delete();
        }

        self.reloadCells();
        self.selectedCell(self.cells()[0]);
    };

    self.selectCell = (cell) => {
        var room = PersistenceService.findFirstBy(ChatRoom, 'chatId', cell.id());
        self.updateBadge(room);
    };

    /* Event Methods */

    self.getDetailObject = (cell) => {
        return cell;
    };

    self.modalFinishedOpening = () => {};

    /**
     * Once a modal is closed, if it was closed by clicking done, then create
     * a new room and add the selected users to it.
     */
    self.modalFinishedClosing = (partyMembersToAdd) => {
        self.modalIsOpen(false);
        if (partyMembersToAdd.length > 0) {
            self.addItem(partyMembersToAdd);
        }
    };

    /**
     * Update the value of the badge for a given room.
     */
    self.updateBadge = (room) => {
        var cellToBadge = self.cells().filter((cell, idx, _) => {
            return cell.id() === room.chatId();
        })[0];
        if (cellToBadge) {
            cellToBadge.badge(room.getUnreadMessages().length);
        }
    };

    // Cell Methods

    /**
     * Fetch all of the cells for the given character/campaign and
     * convert them into cells.
     */
    self.reloadCells = () => {
        self.chats(self._getChats());
        self.cells(self._getChatCells());
    };

    /**
     * Tell each of the existing cells to reload their data.
     * This does NOT reload the list of cells from disk.
     */
    self.refreshCells = () => {
        return self.cells().forEach((cell, idx, _) => {
            cell.reload();
        });
    };

    /* Private Methods */

    self._getChatCells = () => {
        return self.chats().map((chat, idx, _) => {
            var cell = new ChatCellViewModel(chat);
            cell.reload();
            return cell;
        });
    };

    self._getChats = () => {
        var key = CharacterManager.activeCharacter().key();
        var chatService = ChatServiceManager.sharedService();
        var currentPartyNode = chatService.currentPartyNode;
        var chats = PersistenceService.findByPredicates(ChatRoom, [
            new KeyValuePredicate('characterId', key),
            new OrPredicate([
                // Get the party chat.
                new KeyValuePredicate('chatId', currentPartyNode),
                // Get all related chats.
                new KeyValuePredicate('partyId', currentPartyNode)
            ])
        ]);
        return chats.sort((a,b) => {
            var aVal = a.isParty() ? 1 : -1;
            var bVal = b.isParty() ? 1 : -1;

            return bVal - aVal;
        });
    };

    /**
     * Return if the current active room is the same as the provided.
     */
    self._isSelectedRoom = (room) => {
        if (!room || !self.selectedCell()) { return false; }
        return self.selectedCell().id() === room.chatId();
    };

    /**
     * Tell the child view model that it should update its chat messages.
     */
    self._childViewModelShouldUpdate = () => {
        self.selectedObject.valueHasMutated();
    };

    /**
     * Given a chat message, deliver it to the correct room if the room is
     * active, else badge the icon or create the room if needed and alert
     * the user.
     */
    self._deliverMessageToRoom = (room, msg, delay, hideTitle) => {
        self.reloadCells();
        var roomIsSelected = self._isSelectedRoom(room);
        if (roomIsSelected) {
            // The room for this chat is the active room.
            self._childViewModelShouldUpdate();
        } else if (!delay) {
            // The room is in the background. Badge the icon.
            self.updateBadge(room);
        }

        var chatTabIsForground = self.isActive() == 'active';
        if (!chatTabIsForground && !delay && msg.messageType() != CHAT_MESSAGE_TYPES.META) {
            if (!hideTitle) {
                Notifications.userNotification.infoNotification.dispatch(msg.shortHtml(), msg.fromUsername());
            } else {
                Notifications.userNotification.infoNotification.dispatch(msg.shortHtml());
            }

        }
    };

    self._userHasJoinedOrLeft = (presence) => {
        if (self._isMe(presence.fromUsername())) { return; }
        var room = PersistenceService.findFirstBy(ChatRoom, 'chatId', presence.fromBare());
        self._deliverMessageToRoom(room, presence, false, true);
    };

    self._didJoinParty = () => {
        self.reloadCells();
        self.selectedCell(self.cells()[0]);
        self.checkForParty();
    };

    self._hasLeftParty = () => {
        self.reloadCells();
        self._purgeChats();
        self.checkForParty();
    };

    self._isMe = (nick) => {
        var xmpp = XMPPService.sharedService();
        return Strophe.getNodeFromJid(xmpp.connection.jid) === nick;
    };

    self._purgeChats = () => {
        // Chat logs are saved server-side.
        var key = CharacterManager.activeCharacter().key();
        var chats = PersistenceService.findBy(ChatRoom, 'characterId', key);
        chats.forEach((chat, idx, _) => {
            chat.purge();
        });
    };

    return self;
}

ko.components.register('chat', {
    viewModel: ChatViewModel,
    template: template
});
