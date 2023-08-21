import ko from 'knockout';

// Add in Fragment URI Plugin
import 'urijs/src/URI.fragmentURI.js'

import URI from 'urijs';


class Route {

    constructor(params) {
        this.routerContext = params.context;
        this.route = (
            ko.isObservable(params.route)
            ? params.match
            : ko.observable(params.route)
        );
        this.match = (
            ko.isObservable(params.match)
            ? params.match
            : ko.observable(params.match || 'exact')
        );
    }

    sanitizedRoute = ko.pureComputed(() => (
        this.route().startsWith('#!')
        ? this.route()
        : `#!${this.route()}`
    ));

    visible = ko.pureComputed(() => (
        this.match() === 'partial'
        ? this.isPartialMatch(this.routerContext.url())
        : this.isExactMatch(this.routerContext.url())
    ));

    parameters = ko.pureComputed(() => {
        const routeParts = this.getParts(this.sanitizedRoute());
        const urlParts = this.getParts(this.routerContext.url());
        return Object.fromEntries(
            routeParts
            .filter(part => this.isTemplatePart(part))
            .map(part => [this.getParameterName(part), urlParts[routeParts.indexOf(part)]])
        );
    });

    isPartialMatch(url) {
        const routeParts = this.getParts(this.sanitizedRoute());
        const urlParts = this.getParts(url);
        return urlParts.every((urlPart, index) => (
            !routeParts[index] || this.isTemplatePart(routeParts[index])
            ? true
            : urlPart.toLowerCase() === routeParts[index].toLowerCase()
        ));
    }

    isExactMatch(url) {
        const routeParts = this.getParts(this.sanitizedRoute());
        const urlParts = this.getParts(url);
        return routeParts.length === urlParts.length && routeParts.every((routePart, index) => (
            this.isTemplatePart(routePart)
            ? true
            : !!urlParts[index] && routePart.toLowerCase() === urlParts[index].toLowerCase()
        ));
    }

    getParameterName(part) {
        return part.slice(1, part.length - 1);
    }

    getParts(url) {
        const uri = new URI(url);
        const furi = uri.fragment();
        if (furi) {
            return furi.split('/').slice(1, furi.length).filter(part => (!!part));
        } else {
            return [];
        }
    }

    isTemplatePart(part) {
        return /^\{.*\}$/.test(part);
    }

    context = ko.pureComputed(() => ({
        route: this.route,
        parameters: this.parameters,
    }));
}


class Router {

    constructor() {
        this.url = ko.observable(window.location.href);

        window.addEventListener('hashchange', () => {
            this.url(window.location.href);
        });
    }

    context = ko.pureComputed(() => ({
        url: this.url,
    }));
}

ko.components.register('ko-route', {
    viewModel: Route,
    template: `
        <!-- ko if: visible -->
        <!-- ko template: { nodes: $componentTemplateNodes, data: context } --><!-- /ko -->
        <!-- /ko -->
    `
});
ko.components.register('ko-router', {
    viewModel: Router,
    template: `
        <!-- ko template: { nodes: $componentTemplateNodes, data: context } --><!-- /ko -->
    `
});
