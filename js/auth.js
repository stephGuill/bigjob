// Attendre que le DOM et les scripts soient chargés
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier que les managers sont disponibles
    if (typeof authManager === 'undefined' || typeof dataManager === 'undefined') {
        console.error('Erreur: authManager ou dataManager non disponible');
        alert('Erreur de chargement. Veuillez actualiser la page.');
        return;
    }

    // Rediriger si déjà connecté
    if (authManager.isAuthenticated()) {
        window.location.href = 'calendar.html';
        return;
    }

    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const result = authManager.login(email, password);

            if (result.success) {
                showAlert('loginAlert', 'Connexion réussie ! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = 'calendar.html';
                }, 1000);
            } else {
                showAlert('loginAlert', result.message, 'danger');
            }
        });
    }

    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            // Vérifier que les mots de passe correspondent
            if (password !== confirmPassword) {
                showAlert('registerAlert', 'Les mots de passe ne correspondent pas', 'danger');
                return;
            }

            // Vérifier la longueur du mot de passe
            if (password.length < 6) {
                showAlert('registerAlert', 'Le mot de passe doit contenir au moins 6 caractères', 'danger');
                return;
            }

            const result = authManager.register(name, email, password);

            if (result.success) {
                showAlert('registerAlert', 'Inscription réussie ! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = 'calendar.html';
                }, 1500);
            } else {
                showAlert('registerAlert', result.message, 'danger');
            }
        });
    }
});
