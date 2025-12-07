/**
 * Photo Gallery Logic
 * Mimics the C linked list implementation but uses a JS Array for state management.
 */

// State
let gallery = [];
let currentIndex = -1; // Points to 'current' node

// DOM Elements
const currentImage = document.getElementById('currentImage');
const imageTitle = document.getElementById('imageTitle');
const emptyState = document.getElementById('emptyState');
const imageOverlay = document.getElementById('imageOverlay');
const filmstrip = document.getElementById('filmstrip');
const loadingIndicator = document.getElementById('loadingIndicator');

// Modal Elements
const modal = document.getElementById('photoModal');
const photoForm = document.getElementById('photoForm');
const photoNameInput = document.getElementById('photoName');

// Buttons
const btnNext = document.getElementById('nextBtn');
const btnPrev = document.getElementById('prevBtn');
const btnDelete = document.getElementById('deleteBtn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Determine seed data? No, start empty as per C code logic, 
    // but maybe add one demo if empty so it looks good? 
    // Let's stick to C behavior: Empty start.
    renderGallery();
    setupEventListeners();
});

function setupEventListeners() {
    // Controls
    btnNext.addEventListener('click', nextPhoto);
    btnPrev.addEventListener('click', prevPhoto);
    btnDelete.addEventListener('click', () => {
        if (currentIndex !== -1) {
            deletePhoto(gallery[currentIndex].name);
        }
    });

    // Modal
    document.getElementById('addPhotoBtn').addEventListener('click', openModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form
    photoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = photoNameInput.value.trim();
        if (name) {
            insertPhoto(name);
            closeModal();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('hidden')) {
            if (e.key === 'ArrowRight') nextPhoto();
            if (e.key === 'ArrowLeft') prevPhoto();
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (currentIndex !== -1) deletePhoto(gallery[currentIndex].name);
            }
        } else {
            if (e.key === 'Escape') closeModal();
        }
    });
}

// --- Logic mirroring C functions ---

// insertPhoto(char img[])
function insertPhoto(name) {
    // Check duplicates? C code didn't check duplicates on insert, but delete by name removes first match.
    // We'll allow duplicates to be faithful, but in UI maybe distinct IDs are better. 
    // Let's stick to simple array push (insert at end).

    const newNode = {
        name: name,
        // Picsum seed image
        url: `https://picsum.photos/seed/${encodeURIComponent(name)}/1200/800`,
        thumb: `https://picsum.photos/seed/${encodeURIComponent(name)}/200/300`
    };

    gallery.push(newNode);

    // If it was empty, set current to this new one
    if (gallery.length === 1) {
        currentIndex = 0;
    } else {
        // C code: tail gets updated. current stays unless we manually move it?
        // logic: `if (head == NULL) head = tail = current = newNode`
        // so if list was empty, current becomes new. 
        // if not empty, current doesn't change automatically in C code insert.
        // We will follow that.
    }

    renderGallery();

    // Auto-scroll filmstrip to end
    setTimeout(() => {
        filmstrip.scrollTo({ left: filmstrip.scrollWidth, behavior: 'smooth' });
    }, 100);
}

// deletePhoto(char img[])
function deletePhoto(name) {
    // Find index
    // C code deletes first occurrence.
    const indexToDelete = gallery.findIndex(p => p.name === name);

    if (indexToDelete === -1) {
        alert(`Photo '${name}' not found!`);
        return;
    }

    // Logic for updating current pointer
    // C code: if current == temp, current = temp->next ? temp->next : head;

    const isCurrent = (indexToDelete === currentIndex);

    // Remove from array
    gallery.splice(indexToDelete, 1);

    if (gallery.length === 0) {
        currentIndex = -1;
    } else if (isCurrent) {
        // If we deleted the current one
        // Try to go to next (which is now at the same index)
        // If we were at the end, wrap to head (0)
        if (currentIndex >= gallery.length) {
            currentIndex = 0; // Wrap to head
        }
        // else currentIndex is still valid path to 'next' node
    } else {
        // We deleted someone else. 
        // If we deleted someone BEFORE current, we need to shift index down
        if (indexToDelete < currentIndex) {
            currentIndex--;
        }
    }

    renderGallery();
}

// nextPhoto()
function nextPhoto() {
    if (gallery.length === 0) return;

    if (currentIndex < gallery.length - 1) {
        currentIndex++;
    } else {
        // C code doesn't wrap in nextPhoto, just says "Now Viewing: [last]" or stays.
        // Actually: `if (current->next != NULL) current = current->next;`
        // So it stops at the end.
        // Let's add wrap-around for better UX, or stick strictly to C? 
        // "Change it into gui" implies usability. I will add wrap-around or just stop. 
        // Let's stop at end to mimic C, but maybe give a visual shake? 
        // Actually, let's wrap for a better "Gallery" feel.
        currentIndex = 0; // Wrap
    }
    renderGallery();
}

// prevPhoto()
function prevPhoto() {
    if (gallery.length === 0) return;

    if (currentIndex > 0) {
        currentIndex--;
    } else {
        // Wrap to end
        currentIndex = gallery.length - 1;
    }
    renderGallery();
}

// --- Rendering ---

function renderGallery() {
    // 1. Handle Empty State
    if (gallery.length === 0) {
        emptyState.classList.remove('hidden');
        currentImage.classList.add('hidden');
        imageOverlay.classList.add('hidden');
        imageTitle.textContent = '';
        renderFilmstrip();
        return;
    }

    emptyState.classList.add('hidden');
    currentImage.classList.remove('hidden');

    // 2. Update Main Image
    const photo = gallery[currentIndex];

    // Preload handling
    // Only update if source changes to avoid flickering
    if (currentImage.src !== photo.url) {
        loadingIndicator.classList.remove('hidden');
        currentImage.classList.add('hidden'); // Hide old one while loading

        const imgLoader = new Image();
        imgLoader.onload = () => {
            currentImage.src = photo.url;
            currentImage.classList.remove('hidden');
            loadingIndicator.classList.add('hidden');
            imageOverlay.classList.remove('hidden');
        };
        imgLoader.src = photo.url;
    } else {
        imageOverlay.classList.remove('hidden');
    }

    imageTitle.textContent = photo.name;

    // 3. Render Filmstrip
    renderFilmstrip();
}

function renderFilmstrip() {
    filmstrip.innerHTML = '';

    gallery.forEach((photo, idx) => {
        const thumb = document.createElement('div');
        thumb.className = `thumb-card ${idx === currentIndex ? 'active' : ''}`;
        thumb.onclick = () => {
            currentIndex = idx;
            renderGallery();
        };

        const img = document.createElement('img');
        img.src = photo.thumb;
        img.alt = photo.name;
        img.loading = "lazy";

        thumb.appendChild(img);
        filmstrip.appendChild(thumb);

        // Auto-scroll to active
        if (idx === currentIndex) {
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
}

// Helpers
function openModal() {
    photoForm.reset();
    modal.classList.remove('hidden');
    photoNameInput.focus();
}

function closeModal() {
    modal.classList.add('hidden');
}
