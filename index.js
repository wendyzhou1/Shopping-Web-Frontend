// index.js
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {

    let allBooks = [];
    let cart = [];

    const bookList = document.getElementById('bookList');

    if (!bookList) {
        console.error('Error: Could not find bookList element');
        return;
    }
    const requiredElements = [
        'bookList', 'categoryFilter', 'filterBtn',
        'resetFilter', 'searchInput', 'resetCartBtn',
    ];
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            throw new Error(`Required element #${id} not found`);
        }
    });

    loadBooks();
    initCart();
    initEventListeners();

    function initEventListeners() {
        //Filter
        document.getElementById('filterBtn').addEventListener('click', function() {
            console.log('Filter button clicked');
            applyCategoryFilter();
        });
        document.getElementById('resetFilter').addEventListener('click', function() {
            console.log('Reset filter button clicked');
            resetFilter();
        });



        // Search
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', handleSearch);

        // Cart
        document.getElementById('resetCartBtn').addEventListener('click', () => {
            const resetSuccess = resetCart();
            if (resetSuccess) {
                alert('Cart cleared successfully!', 'success');
            }
        });

        //dark mode
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleDarkMode);
        }

        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon && savedDarkMode) {
            cartIcon.src = 'images/white_cart.png';
        }
    }

    // Books
    function loadBooks() {
        getJsonObject('data.json',
            (data) => {
                try {
                    console.log('Data loaded:', data);

                    allBooks = data.map((book, index) => ({
                            title: book.title || 'Untitled',
                            authors: book.authors || 'Unknown Author',
                            year: book.year || 'N/A',
                            category: (book.category || 'Uncategorized').trim(),
                            rating: Math.max(0, Math.min(5, Number(book.rating) || 0)),
                            price: book.price || 0,
                            publisher: book.publisher || 'Unknown Publisher',
                            img: book.img || 'images/default-cover.jpg',
                            id: generateBookId(book)
                    }));

                    console.log('Processed books:', allBooks);
                    populateCategories();
                    renderBooks(allBooks);
                } catch (error) {
                    console.error('Data processing failed:', error);
                    displayError('Fail, please check file format.');
                }
            },
            (err) => {
                console.error('HTTP Error:', xhr.status, xhr.statusText);
                displayError('Fail, please check connection.');
            }
        );
    }

    function generateBookId(book) {
        // 使用稳定特征生成ID（标题+作者+年份）
        const title = book.title || 'Untitled';
        const authors = book.authors || 'Unknown Author';
        const year = book.year || '0000';
        if (!book.title || !book.authors || !book.year) {
            console.error('Invalid book data:', book);
            return 'invalid-book-id';
        }
        const baseString = `${book.title}-${book.authors}-${book.year}`;

        // Hash for id
        return baseString
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    function renderBooks(books) {
        // Clear existing content
        while (bookList.firstChild) {
            bookList.removeChild(bookList.firstChild);
        }

        if (books.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 9;
            td.className = 'no-results';

            // Creating a text node
            const text = document.createTextNode('No books found in this category');
            td.appendChild(text);

            tr.appendChild(td);
            bookList.appendChild(tr);
            return;
        }

        // Creating document fragments to improve performance
        const fragment = document.createDocumentFragment();

        books.forEach((book) => {
            const tr = document.createElement('tr');
            tr.dataset.bookId = book.id;

            appendCell(tr, createCheckbox());
            appendCell(tr, createCoverImage(book));
            appendCell(tr, createTextCell(book.title));
            appendCell(tr, createTextCell(book.authors));
            appendCell(tr, createTextCell(book.year));
            appendCell(tr, createRatingStars(book.rating));
            appendCell(tr, createPriceCell(book.price));
            appendCell(tr, createTextCell(book.publisher));
            appendCell(tr, createTextCell(book.category));

            fragment.appendChild(tr);
        });

        bookList.appendChild(fragment);
        handleSearch();
    }

    // Create a general text cell
    function createTextCell(content) {
        const td = document.createElement('td');
        td.textContent = content;
        return td;
    }

    function createCheckbox() {
        const td = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'book-selector';
        td.appendChild(checkbox);
        return td;
    }

    function createCoverImage(book) {
        const td = document.createElement('td');
        const img = document.createElement('img');
        img.src = book.img;
        img.alt = `${book.title} cover`;
        img.className = 'book-cover';
        td.appendChild(img);
        return td;
    }

    function createPriceCell(price) {
        const td = document.createElement('td');
        td.textContent = `$${price}`;
        return td;
    }

    function createRatingStars(rating) {
        const td = document.createElement('td');
        td.className = 'rating-stars';

        // full star
        for (let i = 0; i < rating; i++) {
            const star = document.createElement('img');
            star.src = 'images/starfill.ico';
            star.alt = 'Filled Star';
            star.className = 'star-icon';
            td.appendChild(star);
        }

        // empty star
        for (let i = rating; i < 5; i++) {
            const star = document.createElement('img');
            star.src = 'images/starempty.ico';
            star.alt = 'Empty Star';
            star.className = 'star-icon';
            td.appendChild(star);
        }

        return td;
    }

    //Table add element function
    function appendCell(row, cell) {
        if (cell instanceof HTMLElement) {
            row.appendChild(cell);
        } else {
            const td = document.createElement('td');
            td.appendChild(cell);
            row.appendChild(td);
        }
    }

    function handleSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const rows = document.querySelectorAll('#bookList tr');

        rows.forEach(row => {
            const titleCell = row.children[2];
            const titleText = titleCell.textContent.toLowerCase();
            const match = searchTerm && titleText.includes(searchTerm);

            // Add/remove highlight classes
            row.classList.toggle('highlight', match);
        });
    }

    // Generate a category drop-down menu
    function populateCategories() {
        const categories = [...new Set(allBooks.map(book => book.category))];
        const categoryFilter = document.getElementById('categoryFilter');

        // Clear existing options
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }

        // Added sorting option (alphabetical sorting)
        categories.sort().forEach(category => {
            const option = new Option(category, category);
            categoryFilter.add(option);
        });

        //A search term that does not match any characters.
        const testOption = new Option('Comic', 'invalid-cat');
        categoryFilter.add(testOption);
    }

    //Category filtering function
    function applyCategoryFilter() {
        const selected = document.getElementById('categoryFilter').value;
        const filtered = selected === ''
            ? allBooks
            : allBooks.filter(book =>
                book.category.toLowerCase() === selected.toLowerCase()
            );
        console.log('Filtered books:', filtered);
        renderBooks(filtered);
    }

    function resetFilter() {
        try {
            const categoryFilter = document.getElementById('categoryFilter');
            if (!categoryFilter) throw new Error('Category filter element not found');

            document.getElementById('categoryFilter').value = ''; // Reset to All Categories
            document.getElementById('searchInput').value = '';    // Clear the search box

            console.log('Reset filter');
            renderBooks(allBooks);
        } catch (error) {
            console.error('Reset error:', error);
        }
    }

    // Cart
    function initCart() {
        // Single-select
        bookList.addEventListener('change', function(e) {
            if (e.target.classList.contains('book-selector')) {
                const checkboxes = document.querySelectorAll('.book-selector');
                checkboxes.forEach(checkbox => {
                    if (checkbox !== e.target) checkbox.checked = false;
                });
            }
        });

        // Add to cart button event
        document.getElementById('addToCart').addEventListener('click', handleAddToCart);
    }

    function handleAddToCart() {
        const selectedCheckbox = document.querySelector('.book-selector:checked');
        if (!selectedCheckbox) {
            alert('Please select a book first');
            return;
        }

        // Adding numeric input validation
        const getValidQuantity = () => {
            const input = prompt('Enter quantity (1-99):', '1');
            const quantity = parseInt(input);
            return (Number.isInteger(quantity) && quantity > 0 && quantity < 100)
                ? quantity
                : alert('Invalid quantity! Please enter 1-99');
        };

        const quantity = getValidQuantity();
        if (!quantity) return;

        // Get book data
        const bookRow = selectedCheckbox.closest('tr');
        const bookData = {
            id: bookRow.dataset.bookId,
            title: bookRow.cells[2].textContent,
            price: parseFloat(bookRow.cells[6].textContent.replace('$', ''))
        };

        // Update shopping cart
        const existingItem = cart.find(item => item.id === bookData.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                ...bookData,
                quantity: quantity
            });
        }

        selectedCheckbox.checked = false;
        updateCartDisplay();
    }

    function updateCartDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = totalItems;
    }

    function resetCart() {
        // Empty shopping cart
        if (cart.length === 0) {
            alert('Your cart is already empty!');
            return false;
        }

        // Show confirmation dialog with detailed data
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const confirmMessage =
            `Are you sure you want to reset the cart?\n\n` +
            `Currently ${totalItems} items from ${cart.length} different books.`;

        if (!confirm(confirmMessage)) {
            console.log('Cart reset cancelled by user');
            return false;
        }

        // Perform a reset operation
        cart.length = 0;
        updateCartDisplay();

        return true;
    }

    //Read json file
    function getJsonObject(path, success, error) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    try {
                        success(JSON.parse(xhr.responseText));
                    } catch (e) {
                        error({ status: 500, statusText: 'Invalid JSON' });
                    }
                } else {
                    error(xhr);
                }
            }
        };
        xhr.open("GET", path, true);
        xhr.send();
    }

    //Book display error
    function displayError(message) {
        const bookList = document.getElementById('bookList');
        if (!bookList) return;

        const tr = document.createElement('tr');
        const td = document.createElement('td');
        const text = document.createTextNode(message);

        td.colSpan = 9;
        td.className = 'error';

        td.appendChild(text);
        tr.appendChild(td);

        while (bookList.firstChild) {
            bookList.removeChild(bookList.firstChild);
        }
        bookList.appendChild(tr);
    }

    //Dark mode
    function toggleDarkMode() {
        const body = document.body;
        body.classList.toggle('dark-mode');

        const isDarkMode = body.classList.contains('dark-mode');
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.src = isDarkMode
                ? 'images/shopping_cart_dark.png'
                : 'images/shopping_cart.png';
        }
        // Save status
        localStorage.setItem('darkMode', isDarkMode);
    }
}
