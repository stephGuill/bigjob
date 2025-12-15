$(document).ready(function() {
    // Vérifier l'authentification
    if (!authManager.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = authManager.getCurrentUser();
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDateForRequest = null;

    // Afficher le nom de l'utilisateur
    $('#userNameDisplay').text(currentUser.name);

    // Afficher le lien backoffice si modérateur ou admin
    if (authManager.hasRole('moderator')) {
        $('#backofficeLink').show();
    }

    // Gestion de la déconnexion
    $('#logoutBtn').on('click', function(e) {
        e.preventDefault();
        authManager.logout();
    });

    // Fonction pour afficher le calendrier
    function renderCalendar(month, year) {
        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        $('#currentMonthYear').text(`${monthNames[month]} ${year}`);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Ajuster pour que lundi soit le premier jour (0 = dimanche -> 6)
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        const calendarBody = $('#calendarBody');
        calendarBody.empty();

        const userReservations = dataManager.getUserReservations(currentUser.id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let date = 1;
        let finished = false;

        for (let i = 0; i < 6 && !finished; i++) {
            const row = $('<tr></tr>');

            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < adjustedFirstDay) {
                    row.append('<td class="text-muted"></td>');
                } else if (date > daysInMonth) {
                    row.append('<td class="text-muted"></td>');
                    finished = true;
                } else {
                    const cellDate = new Date(year, month, date);
                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    
                    // Vérifier si une réservation existe pour cette date
                    const reservation = userReservations.find(r => r.date === dateString);
                    
                    let cellClass = 'calendar-day';
                    let cellContent = `<div class="day-number">${date}</div>`;
                    
                    if (cellDate < today) {
                        cellClass += ' past-day';
                    } else {
                        cellClass += ' clickable-day';
                    }

                    if (reservation) {
                        if (reservation.status === 'approved') {
                            cellClass += ' reservation-approved';
                            cellContent += '<span class="badge bg-success">Confirmée</span>';
                        } else if (reservation.status === 'pending') {
                            cellClass += ' reservation-pending';
                            cellContent += '<span class="badge bg-warning">En attente</span>';
                        } else if (reservation.status === 'rejected') {
                            cellClass += ' reservation-rejected';
                            cellContent += '<span class="badge bg-danger">Refusée</span>';
                        }
                    }

                    const cell = $(`<td class="${cellClass}" data-date="${dateString}">${cellContent}</td>`);
                    
                    // Ajouter l'événement de clic seulement pour les dates futures sans réservation
                    if (cellDate >= today && !reservation) {
                        cell.on('click', function() {
                            selectedDateForRequest = $(this).data('date');
                            $('#selectedDate').text(formatDate(selectedDateForRequest));
                            const modal = new bootstrap.Modal(document.getElementById('requestModal'));
                            modal.show();
                        });
                    }

                    row.append(cell);
                    date++;
                }
            }

            calendarBody.append(row);
        }
    }

    // Navigation mois précédent
    $('#prevMonth').on('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    // Navigation mois suivant
    $('#nextMonth').on('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    // Confirmer la demande de présence
    $('#confirmRequest').on('click', function() {
        if (selectedDateForRequest) {
            // Vérifier si une réservation existe déjà pour cette date
            const existingReservation = dataManager.getUserReservations(currentUser.id)
                .find(r => r.date === selectedDateForRequest);

            if (existingReservation) {
                showAlert('calendarAlert', 'Vous avez déjà une demande pour cette date', 'warning');
            } else {
                dataManager.addReservation({
                    userId: currentUser.id,
                    date: selectedDateForRequest,
                    status: 'pending'
                });

                showAlert('calendarAlert', 'Votre demande de présence a été enregistrée', 'success');
                renderCalendar(currentMonth, currentYear);
                renderReservationsList();
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById('requestModal'));
            modal.hide();
            selectedDateForRequest = null;
        }
    });

    // Fonction pour afficher la liste des réservations
    function renderReservationsList() {
        const reservationsList = $('#reservationsList');
        reservationsList.empty();

        const userReservations = dataManager.getUserReservations(currentUser.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (userReservations.length === 0) {
            reservationsList.append(`
                <tr>
                    <td colspan="3" class="text-center text-muted">
                        Aucune demande de présence
                    </td>
                </tr>
            `);
            return;
        }

        userReservations.forEach(reservation => {
            const dateObj = new Date(reservation.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = dateObj < today;

            let statusBadge = '';
            let actionButtons = '';

            if (reservation.status === 'approved') {
                statusBadge = '<span class="badge bg-success">Confirmée</span>';
            } else if (reservation.status === 'pending') {
                statusBadge = '<span class="badge bg-warning">En attente</span>';
            } else if (reservation.status === 'rejected') {
                statusBadge = '<span class="badge bg-danger">Refusée</span>';
            }

            // Permettre la suppression seulement si la date n'est pas passée
            if (!isPast && reservation.status === 'pending') {
                actionButtons = `
                    <button class="btn btn-sm btn-danger delete-reservation" data-id="${reservation.id}">
                        <i class="bi bi-trash"></i> Annuler
                    </button>
                `;
            } else {
                actionButtons = '<span class="text-muted">-</span>';
            }

            reservationsList.append(`
                <tr>
                    <td>${formatDate(reservation.date)}</td>
                    <td>${statusBadge}</td>
                    <td>${actionButtons}</td>
                </tr>
            `);
        });

        // Gestion de la suppression
        $('.delete-reservation').on('click', function() {
            const reservationId = $(this).data('id');
            if (confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
                dataManager.deleteReservation(reservationId);
                showAlert('calendarAlert', 'Demande annulée', 'info');
                renderCalendar(currentMonth, currentYear);
                renderReservationsList();
            }
        });
    }

    // Initialisation
    renderCalendar(currentMonth, currentYear);
    renderReservationsList();
});
