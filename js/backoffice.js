$(document).ready(function() {
    // Vérifier l'authentification et les permissions
    if (!authManager.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    if (!authManager.hasRole('moderator')) {
        alert('Accès refusé : vous devez être modérateur ou administrateur');
        window.location.href = 'calendar.html';
        return;
    }

    const currentUser = authManager.getCurrentUser();
    let selectedUserId = null;

    // Afficher le nom de l'utilisateur
    $('#userNameDisplay').text(currentUser.name);

    // Afficher l'onglet admin si l'utilisateur est admin
    if (authManager.hasRole('admin')) {
        $('#adminTabLi').show();
    }

    // Gestion de la déconnexion
    $('#logoutBtn').on('click', function(e) {
        e.preventDefault();
        authManager.logout();
    });

    // Fonction pour afficher les demandes en attente
    function renderPendingRequests() {
        const pendingList = $('#pendingList');
        pendingList.empty();

        const reservations = dataManager.getReservations()
            .filter(r => r.status === 'pending')
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        $('#pendingCount').text(reservations.length);

        if (reservations.length === 0) {
            pendingList.append(`
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        Aucune demande en attente
                    </td>
                </tr>
            `);
            return;
        }

        reservations.forEach(reservation => {
            const user = dataManager.getUser(reservation.userId);
            if (!user) return;

            pendingList.append(`
                <tr>
                    <td>${formatDate(reservation.date)}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${formatDateTime(reservation.createdAt)}</td>
                    <td>
                        <button class="btn btn-sm btn-success approve-request me-2" data-id="${reservation.id}">
                            <i class="bi bi-check-circle"></i> Approuver
                        </button>
                        <button class="btn btn-sm btn-danger reject-request" data-id="${reservation.id}">
                            <i class="bi bi-x-circle"></i> Refuser
                        </button>
                    </td>
                </tr>
            `);
        });

        // Gestion de l'approbation
        $('.approve-request').on('click', function() {
            const reservationId = $(this).data('id');
            dataManager.updateReservation(reservationId, { status: 'approved' });
            showAlert('backofficeAlert', 'Demande approuvée avec succès', 'success');
            refreshAllLists();
        });

        // Gestion du refus
        $('.reject-request').on('click', function() {
            const reservationId = $(this).data('id');
            if (confirm('Êtes-vous sûr de vouloir refuser cette demande ?')) {
                dataManager.updateReservation(reservationId, { status: 'rejected' });
                showAlert('backofficeAlert', 'Demande refusée', 'info');
                refreshAllLists();
            }
        });
    }

    // Fonction pour afficher les demandes approuvées
    function renderApprovedRequests() {
        const approvedList = $('#approvedList');
        approvedList.empty();

        const reservations = dataManager.getReservations()
            .filter(r => r.status === 'approved')
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (reservations.length === 0) {
            approvedList.append(`
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        Aucune demande approuvée
                    </td>
                </tr>
            `);
            return;
        }

        reservations.forEach(reservation => {
            const user = dataManager.getUser(reservation.userId);
            if (!user) return;

            const isPast = new Date(reservation.date) < new Date();

            approvedList.append(`
                <tr>
                    <td>${formatDate(reservation.date)}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${formatDateTime(reservation.updatedAt)}</td>
                    <td>
                        ${!isPast ? `
                            <button class="btn btn-sm btn-warning cancel-approval" data-id="${reservation.id}">
                                <i class="bi bi-arrow-counterclockwise"></i> Annuler
                            </button>
                        ` : '<span class="text-muted">Date passée</span>'}
                    </td>
                </tr>
            `);
        });

        // Gestion de l'annulation
        $('.cancel-approval').on('click', function() {
            const reservationId = $(this).data('id');
            if (confirm('Voulez-vous annuler cette approbation ?')) {
                dataManager.updateReservation(reservationId, { status: 'pending' });
                showAlert('backofficeAlert', 'Approbation annulée', 'info');
                refreshAllLists();
            }
        });
    }

    // Fonction pour afficher les demandes refusées
    function renderRejectedRequests() {
        const rejectedList = $('#rejectedList');
        rejectedList.empty();

        const reservations = dataManager.getReservations()
            .filter(r => r.status === 'rejected')
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (reservations.length === 0) {
            rejectedList.append(`
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        Aucune demande refusée
                    </td>
                </tr>
            `);
            return;
        }

        reservations.forEach(reservation => {
            const user = dataManager.getUser(reservation.userId);
            if (!user) return;

            const isPast = new Date(reservation.date) < new Date();

            rejectedList.append(`
                <tr>
                    <td>${formatDate(reservation.date)}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${formatDateTime(reservation.updatedAt)}</td>
                    <td>
                        ${!isPast ? `
                            <button class="btn btn-sm btn-success restore-request" data-id="${reservation.id}">
                                <i class="bi bi-arrow-counterclockwise"></i> Restaurer
                            </button>
                        ` : '<span class="text-muted">Date passée</span>'}
                    </td>
                </tr>
            `);
        });

        // Gestion de la restauration
        $('.restore-request').on('click', function() {
            const reservationId = $(this).data('id');
            if (confirm('Voulez-vous restaurer cette demande en attente ?')) {
                dataManager.updateReservation(reservationId, { status: 'pending' });
                showAlert('backofficeAlert', 'Demande restaurée', 'success');
                refreshAllLists();
            }
        });
    }

    // Fonction pour afficher la liste des utilisateurs (admin seulement)
    function renderUsersList() {
        if (!authManager.hasRole('admin')) return;

        const usersList = $('#usersList');
        usersList.empty();

        const users = dataManager.getUsers()
            .filter(u => u.id !== currentUser.id)
            .sort((a, b) => a.name.localeCompare(b.name));

        if (users.length === 0) {
            usersList.append(`
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        Aucun autre utilisateur
                    </td>
                </tr>
            `);
            return;
        }

        users.forEach(user => {
            let roleBadge = '';
            if (user.role === 'admin') {
                roleBadge = '<span class="badge bg-danger">Administrateur</span>';
            } else if (user.role === 'moderator') {
                roleBadge = '<span class="badge bg-warning">Modérateur</span>';
            } else {
                roleBadge = '<span class="badge bg-secondary">Utilisateur</span>';
            }

            usersList.append(`
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${roleBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-primary change-role" data-id="${user.id}" data-name="${user.name}" data-role="${user.role}">
                            <i class="bi bi-pencil"></i> Modifier le rôle
                        </button>
                    </td>
                </tr>
            `);
        });

        // Gestion du changement de rôle
        $('.change-role').on('click', function() {
            selectedUserId = $(this).data('id');
            const userName = $(this).data('name');
            const currentRole = $(this).data('role');

            $('#roleUserName').text(userName);
            $('#newRole').val(currentRole);

            const modal = new bootstrap.Modal(document.getElementById('roleModal'));
            modal.show();
        });
    }

    // Confirmer le changement de rôle
    $('#confirmRoleChange').on('click', function() {
        if (selectedUserId) {
            const newRole = $('#newRole').val();
            dataManager.updateUser(selectedUserId, { role: newRole });
            
            showAlert('backofficeAlert', 'Rôle modifié avec succès', 'success');
            renderUsersList();

            const modal = bootstrap.Modal.getInstance(document.getElementById('roleModal'));
            modal.hide();
            selectedUserId = null;
        }
    });

    // Fonction pour rafraîchir toutes les listes
    function refreshAllLists() {
        renderPendingRequests();
        renderApprovedRequests();
        renderRejectedRequests();
        if (authManager.hasRole('admin')) {
            renderUsersList();
        }
    }

    // Initialisation
    refreshAllLists();
});
