// Gestion du LocalStorage pour simuler le comportement JSON
class DataManager {
    constructor() {
        this.initData();
    }

    initData() {
        try {
            // Initialiser les données si elles n'existent pas ou sont invalides
            const usersData = localStorage.getItem('users');
            if (!usersData || usersData === 'undefined' || usersData === 'null') {
                const defaultUsers = [
                    {
                        id: 1,
                        name: "Admin User",
                        email: "admin@laplateforme.io",
                        password: "admin123",
                        role: "admin"
                    },
                    {
                        id: 2,
                        name: "Moderator User",
                        email: "moderator@laplateforme.io",
                        password: "modo123",
                        role: "moderator"
                    },
                    {
                        id: 3,
                        name: "Jean Dupont",
                        email: "jean.dupont@laplateforme.io",
                        password: "user123",
                        role: "user"
                    }
                ];
                localStorage.setItem('users', JSON.stringify(defaultUsers));
            }

            const reservationsData = localStorage.getItem('reservations');
            if (!reservationsData || reservationsData === 'undefined' || reservationsData === 'null') {
            const defaultReservations = [
                {
                    id: 1,
                    userId: 3,
                    date: "2025-12-15",
                    status: "pending",
                    createdAt: "2025-12-10T10:30:00",
                    updatedAt: "2025-12-10T10:30:00"
                },
                {
                    id: 2,
                    userId: 3,
                    date: "2025-12-20",
                    status: "approved",
                    createdAt: "2025-12-09T14:20:00",
                    updatedAt: "2025-12-10T09:15:00"
                }
            ];
            localStorage.setItem('reservations', JSON.stringify(defaultReservations));
        }
        } catch (e) {
            console.error('Erreur initialisation données:', e);
        }
    }

    getUsers() {
        try {
            const data = localStorage.getItem('users');
            const parsed = data ? JSON.parse(data) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Erreur lecture users:', e);
            return [];
        }
    }

    getUser(id) {
        const users = this.getUsers();
        return users.find(user => user.id === id);
    }

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    }

    addUser(user) {
        const users = this.getUsers();
        user.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }

    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    getReservations() {
        try {
            const data = localStorage.getItem('reservations');
            const parsed = data ? JSON.parse(data) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Erreur lecture reservations:', e);
            return [];
        }
    }

    getReservation(id) {
        const reservations = this.getReservations();
        return reservations.find(res => res.id === id);
    }

    getUserReservations(userId) {
        const reservations = this.getReservations();
        return reservations.filter(res => res.userId === userId);
    }

    addReservation(reservation) {
        const reservations = this.getReservations();
        reservation.id = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
        reservation.createdAt = new Date().toISOString();
        reservation.updatedAt = new Date().toISOString();
        reservations.push(reservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        return reservation;
    }

    updateReservation(reservationId, updates) {
        const reservations = this.getReservations();
        const index = reservations.findIndex(r => r.id === reservationId);
        if (index !== -1) {
            reservations[index] = { ...reservations[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('reservations', JSON.stringify(reservations));
            return reservations[index];
        }
        return null;
    }

    deleteReservation(reservationId) {
        const reservations = this.getReservations();
        const filtered = reservations.filter(r => r.id !== reservationId);
        localStorage.setItem('reservations', JSON.stringify(filtered));
    }
}

// Gestion de l'authentification
class AuthManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    getCurrentUser() {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    setCurrentUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (role === 'moderator') {
            return user.role === 'moderator' || user.role === 'admin';
        }
        if (role === 'admin') {
            return user.role === 'admin';
        }
        return true;
    }

    login(email, password) {
        const user = this.dataManager.getUserByEmail(email);
        if (user && user.password === password) {
            this.setCurrentUser(user);
            return { success: true, user };
        }
        return { success: false, message: 'Email ou mot de passe incorrect' };
    }

    register(name, email, password) {
        // Vérifier le domaine email
        if (!email.endsWith('@laplateforme.io')) {
            return { success: false, message: 'Seuls les emails @laplateforme.io sont autorisés' };
        }

        // Vérifier si l'email existe déjà
        if (this.dataManager.getUserByEmail(email)) {
            return { success: false, message: 'Cet email est déjà utilisé' };
        }

        const user = this.dataManager.addUser({
            name,
            email,
            password,
            role: 'user'
        });

        this.setCurrentUser(user);
        return { success: true, user };
    }
}

// Utilitaires
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function formatDateTime(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function showAlert(elementId, message, type) {
    const alert = document.getElementById(elementId);
    if (!alert) return;
    
    alert.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning', 'alert-info');
    alert.classList.add(`alert-${type}`);
    alert.textContent = message;
    
    setTimeout(() => {
        alert.classList.add('d-none');
    }, 5000);
}

// Initialiser les managers globaux dès le chargement
let dataManager;
let authManager;

// S'assurer que tout est initialisé
if (typeof DataManager !== 'undefined' && typeof AuthManager !== 'undefined') {
    dataManager = new DataManager();
    authManager = new AuthManager(dataManager);
}
