document.addEventListener("DOMContentLoaded", function() {
    console.log("dom loaded")
    const undoInput = document.querySelector("#text-input")
    const categoryInput = document.querySelector("#category-select-input")
    const addUndoButton = document.querySelector("#add-new-button")
    const itemsRow = document.querySelector(".items-row")
    const filterBtns = document.querySelectorAll(".category")
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const newItemForm = document.querySelector("form.input-row")

    let undoItems = getItems()
    let currentFilter = "All"


    checkEmpty()
    if (undoItems.length != 0) renderItems()

    newItemForm.addEventListener("submit", function(e) {
        e.preventDefault();

        let title = capitalizeFirstLetter(undoInput.value.trim())
        if (!title) {
            alert("Please do not leave the box empty")
            return false;
        }
        let category = categoryInput.value 

        let newItem = {
            id: Date.now(),
            text: title,
            category: category,
            completed: false,
            createdAt: new Date()
        }

        undoItems.unshift(newItem)
        saveItems()
        renderItems()

        undoInput.value = ""

        return false;
    })

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.id;
            currentFilter = filter;
            
            // Update active state
            filterBtns.forEach(b => {
                b.classList.remove("category-active");
            });
            this.classList.add("category-active");
            
            renderItems();
        });
    });

    function renderItems() {
        let items = currentFilter === "All" ? undoItems : undoItems.filter(item => item.category === currentFilter)
        itemsRow.innerHTML = ""

        items.forEach(item => {
            let newItem = document.createElement("div")
            newItem.classList.add("item-card")
            // if (item.completed) newItem.classList.add("completed")
            // else newItem.classList.remove("completed")
            newItem.innerHTML = `
                <input type="checkbox" class="toggle-completed" data-id="${item.id}" ${item.completed ? 'checked' : ''}>
                <div class="item-content">
                    <p class="item-title ${(item.completed)? "completed" : ""}">${item.text}</p>
                    <div class="item-details">
                        <span class="item-category ${item.category}">${item.category}</span>
                        <span class="item-date">${formatDate(item.createdAt)}</span>
                    </div>
                </div>
                <i class="fa-solid fa-trash delete-icon" data-id="${item.id}"></i>
            `
            itemsRow.appendChild(newItem)
        })
        addCompleteEventListener()
        addDeleteEventListener()
        updateProgress()
        checkEmpty()

    }

    function checkEmpty() {
        let noItemsDiv = document.querySelector(".no-items"); // Check if the div already exists

        if (undoItems.length === 0) {
            if (!noItemsDiv) { // Only create it if it doesn't exist
                noItemsDiv = document.createElement("div");
                noItemsDiv.classList.add("no-items"); // Add a class for easy selection
                const noItemTitle = document.createElement("p");
                noItemTitle.classList.add("no-items-title");
                noItemTitle.textContent = "Your to-undo list is empty";
                noItemsDiv.appendChild(noItemTitle);
                itemsRow.appendChild(noItemsDiv);
            }
        } else {
            if (noItemsDiv) { // Only remove it if it exists
                itemsRow.removeChild(noItemsDiv);
            }
        }
    }

    function addCompleteEventListener() {
        document.querySelectorAll('.toggle-completed').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const id = parseInt(this.dataset.id);
                toggleCompleted(id);
            });
        });
    }

    function addDeleteEventListener() {
        document.querySelectorAll('.delete-icon').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                deleteItem(id);
            });
        });
    }

    function deleteItem(id) {
        undoItems = undoItems.filter(item => item.id !== id);
        saveItems();
        renderItems();
        updateProgress();
    }

    function toggleCompleted(id) {
        undoItems = undoItems.map(item => {
            if (item.id === id) {
                return { ...item, completed: !item.completed };
            }
            return item;
        });
        
        saveItems();
        renderItems();
        updateProgress();
    }

    function getItems() {
        const itemsString = localStorage.getItem("items")
        if (!itemsString) return []
        else {
            return JSON.parse(itemsString)
        }
    }

    function updateProgress() {
        if (!Array.isArray(undoItems) || undoItems.length === 0) {
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            return;
        }

        const completedCount = currentFilter === "All" 
            ? undoItems.filter(item => item.completed).length 
            : undoItems.filter(item => item.completed && item.category === currentFilter).length;

        const totalItems = currentFilter === "All" 
            ? undoItems.length 
            : undoItems.filter(item => item.category === currentFilter).length;

        // Prevent division by zero
        const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;

        // console.log({ completedCount, totalItems, percentage }); // Debugging output
    }


    function saveItems() {
        localStorage.setItem("items", JSON.stringify(undoItems))
    }

    function capitalizeFirstLetter(str) {
        if (!str) return ""; // Handle empty strings
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
})