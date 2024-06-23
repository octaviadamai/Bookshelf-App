const bookShelf = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'bookShelf-app';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function makeNewBook(bookItem){
    const {id, title, author, year, isComplete} = bookItem;

    const bookTitle = document.createElement('h3');
    bookTitle.innerText = title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = `Penulis: ${author}`;

    const bookYear = document.createElement('p');
    bookYear.innerText = `Tahun: ${year}`;

    const elementContainer = document.createElement('article');
    elementContainer.classList.add('book-item');
    elementContainer.append(bookTitle, bookAuthor, bookYear);

    const container = document.createElement('div');
    container.classList.add('book_item', 'shadow'); 
    container.append(elementContainer);
    container.setAttribute('id', `book-${id}`);

    if(isComplete){
        const undoButton = createUndoButton(id);
        const trashButton = createTrashButton(id);
        container.append(undoButton, trashButton);
    } else {
        const checkButton = createCheckButton(id);
        const trashButton = createTrashButton(id);
        container.append(checkButton, trashButton);
    }
    return container;
}

function createUndoButton(id) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.innerText = 'Belum selesai dibaca'
    undoButton.style.backgroundColor = 'darkgreen';
    undoButton.style.color = 'white'; 
    undoButton.style.marginRight = '8px'; 
    undoButton.style.borderRadius = '5px'; 
    undoButton.addEventListener('click', function(){
        undoBookFromComplete(id);
    });
    return undoButton;
}

function createTrashButton(id) {
    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.innerText = 'Hapus Buku'
    trashButton.style.backgroundColor = 'darkred'; 
    trashButton.style.color = 'white'; 
    trashButton.style.marginRight = '8px'; 
    trashButton.style.borderRadius = '5px'; 
    trashButton.addEventListener('click', function(){
        deleteBookFromBookShelf(id);
    });
    return trashButton;
}

function createCheckButton(id) {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.innerText = 'Selesai dibaca'
    checkButton.style.backgroundColor = 'darkgreen'; 
    checkButton.style.color = 'white'; 
    checkButton.style.marginRight = '8px'; 
    checkButton.style.borderRadius = '5px'; 
    checkButton.addEventListener('click', function(){
        addBooktoComplete(id);
    });
    return checkButton;
}

function findBookById(bookId) {
    for(const bookItem of bookShelf){
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
}

function undoBookFromComplete(bookId){
    const bookTarget = findBookById(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBooktoComplete(bookId){
    const bookTarget = findBookById(bookId);
    
    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findIndexBook(bookId) {
    for(const index in bookShelf){
        if(bookShelf[index].id === bookId){
            return index;
        }
    }
    return -1;
}

function isStorageExist() {
    if(typeof(Storage) == undefined){
        alert('Brosur kamu tidak mendukung local storage'); 
        return false;
    }
    return true;
}

function saveData() {
    if(isStorageExist()){
        const parsed = JSON.stringify(bookShelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function changeText(checkBoxElement){
    if(checkBoxElement.checked){
        document.getElementById('checked').innerText = 'Selesai dibaca';
    } else {
        document.getElementById('checked').innerText = 'Belum selesai dibaca';
    }
}

function deleteBookFromBookShelf(bookId){
    const bookTarget = findIndexBook(bookId);

    if(bookTarget === -1) return;
    const confirmation = confirm('Apakah Anda yakin ingin menghapus buku ini?');

    if (confirmation) {
        bookShelf.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
}

function addBook(){
    const titleBook = document.getElementById('inputBookTitle').value;
    const authorBook = document.getElementById('inputBookAuthor').value;
    const yearBook = document.getElementById('inputBookYear').value;

    const getID = generateId();
    const completedBook = document.getElementById('inputBookIsComplete').checked;

    if(completedBook){
        const bookItem = generateBookObject(getID, titleBook, authorBook, parseInt(yearBook), true);
        bookShelf.push(bookItem);
    } else {
        const bookItem = generateBookObject(getID, titleBook, authorBook, parseInt(yearBook), false);
        bookShelf.push(bookItem);
    }

    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
    document.getElementById('inputBookIsComplete').checked = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function loadDataFromStorage() {
    const lookUpData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(lookUpData);

    if (data !== null) {
        for (const book of data) {
            bookShelf.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooks(keyword) {
    const searchResult = [];
    const lowercaseKeyword = keyword.toLowerCase();

    for (const bookItem of bookShelf) {
        const lowercaseTitle = bookItem.title.toLowerCase();
        const lowercaseAuthor = bookItem.author.toLowerCase();

        if (lowercaseTitle.includes(lowercaseKeyword) || lowercaseAuthor.includes(lowercaseKeyword)) {
            searchResult.push(bookItem);
        }
    }

    return searchResult;
}

function renderBooks(books) {
    const unCompletedList = document.getElementById('incompleteBookshelfList');
    const completeList = document.getElementById('completeBookshelfList');

    if (!unCompletedList || !completeList) {
        console.error('Error: One or both of the bookshelf lists are missing.');
        return;
    }

    unCompletedList.innerHTML = '';
    completeList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeNewBook(bookItem);
        if (bookItem.isComplete) {
            completeList.append(bookElement);
        } else {
            unCompletedList.append(bookElement);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('inputBook');
    const searchForm = document.getElementById('searchBook');
    
    submitForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addBook();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const searchTerm = document.getElementById('searchInput').value.trim();
        const searchResult = searchBooks(searchTerm);
        renderBooks(searchResult);
    });
});

document.addEventListener(SAVED_EVENT, () => {
    console.log('buku berhasil disimpan');
});

document.addEventListener(RENDER_EVENT, () => {
    const unCompletedList = document.getElementById('incompleteBookshelfList');
    const completeList = document.getElementById('completeBookshelfList');

    if (!unCompletedList || !completeList) {
        console.error('Error: One or both of the bookshelf lists are missing.');
        return;
    }

    unCompletedList.innerHTML = '';
    completeList.innerHTML = '';

    for (const bookItem of bookShelf) {
        const bookElement = makeNewBook(bookItem);
        if (bookItem.isComplete) {
            completeList.append(bookElement);
        } else {
            unCompletedList.append(bookElement);
        }
    }
});

