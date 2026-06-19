import { Client, Account, ID, Avatars } from "appwrite";

export class AuthService {
    client = new Client();
    account;
    avatars;

    constructor() {
        this.client
            .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
            .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
        this.account = new Account(this.client);
        this.avatars = new Avatars(this.client);
    }

    getUserAvatar(name) {
        return this.avatars.getInitials(name);
    }

    async createAccount({ email, password, name }) {
        const userAccount = await this.account.create(ID.unique(), email, password, name);
        if (userAccount) {
            // call another method
            return this.login({ email, password });
        } else {
            return userAccount;
        }
    }

    async login({ email, password }) {
        return await this.account.createEmailPasswordSession(email, password);
    }

    async loginWithGoogle() {
        return this.account.createOAuth2Session(
            'google',
            window.location.origin,
            window.location.origin + '/login'
        );
    }

    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            // Silently return null for guests without logging errors
            return null;
        }
    }

    async updatePrefs(prefs) {
        try {
            return await this.account.updatePrefs(prefs);
        } catch (error) {
            console.log("Appwrite service :: updatePrefs :: error", error);
            throw error;
        }
    }

    async getPrefs() {
        try {
            return await this.account.getPrefs();
        } catch (error) {
            console.log("Appwrite service :: getPrefs :: error", error);
            return {};
        }
    }

    async logout() {
        try {
            await this.account.deleteSessions();
        } catch (error) {
            console.log("Appwrite service :: logout :: error", error);
        }
    }
}

const authService = new AuthService();

export default authService;
