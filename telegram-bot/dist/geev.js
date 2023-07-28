"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const telegram_1 = require("./telegram");
const node_fetch_1 = require("node-fetch");
const env_1 = require("./env");
function fetchUnreadMessages() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return node_fetch_1.default('https://prod.geev.fr/api/v0.19/user/self/conversations?limit=true', {
            headers: {
                accept: 'application/json, text/plain, */*',
                'x-geev-token': env_1.default('GEEV_AUTH_TOKEN'),
            },
            body: null,
            method: 'GET',
        })
            .then(res => res.json())
            .then(res => {
            const messages = [];
            res.forEach(donation => {
                donation.conversations.forEach(conversation => {
                    if (!conversation.last_received_message)
                        return;
                    if (conversation.unread_message_count) {
                        messages.push({
                            donationTitle: donation.title,
                            profile: conversation.respondent,
                            message: conversation.last_received_message,
                        });
                    }
                });
            });
            return messages;
        });
    });
}
function unreadMessageToString(message) {
    let out = `====== ${message.donationTitle} ======\n`;
    out += `\n`;
    out += `${message.profile.first_name}:\n`;
    out += `${message.message.message}`;
    return out;
}
class GeevWatcher extends telegram_1.Watcher {
    constructor() {
        super(env_1.default('GEEV_BOT_ID'));
        this.notifiedMessageIds = new Set();
    }
    update() {
        fetchUnreadMessages().then(messages => {
            messages = messages.filter(message => !this.notifiedMessageIds.has(message.message.id));
            for (const val of this.notifiedMessageIds.values()) {
                if (messages.some(message => message.message.id === val))
                    this.notifiedMessageIds.delete(val);
            }
            messages.forEach(message => {
                this.notifiedMessageIds.add(message.message.id);
                this.sendMessage(unreadMessageToString(message));
            });
        });
    }
}
exports.default = GeevWatcher;
