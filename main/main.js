const bookShelf = [];
const RENDER_EVENT = "render-book";

document.addEventListener("DOMContentLoaded", function () {
	const submitForm = document.getElementById("inputBook");
	submitForm.addEventListener("submit", function (event) {
		event.preventDefault();
		addBook();
	});
	if (isStorageExist()) {
		loadDataFromStorage();
	}
});

function functCheck() {
	let checkBox = document.getElementById("inputBookIsComplete");
	let text = document.getElementById("before");
	if (checkBox.checked == true) {
		text.innerHTML = "<strong>&nbsp;Selesai Dibaca</strong>";
	} else {
		text.innerHTML = "<strong>&nbsp;Belum Selesai Dibaca</strong>";
	}
}
function addBook() {
	const textTitle = document.getElementById("txtTitle").value;
	const textAuthor = document.getElementById("txtAuthor").value;
	const year = document.getElementById("txtYear").value;
	const isComplete = document.getElementById("inputBookIsComplete").checked;

	const generatedID = generateId();
	const bookObject = generateBookObject(generatedID, textTitle, textAuthor, year, isComplete);
	bookShelf.push(bookObject);

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function generateId() {
	return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
	return {
		id,
		title,
		author,
		year,
		isComplete,
	};
}

document.addEventListener(RENDER_EVENT, function () {
	const uncompletedList = document.getElementById("incompleteBookshelfList");
	uncompletedList.innerHTML = "";

	const completedList = document.getElementById("completeBookshelfList");
	completedList.innerHTML = "";

	for (const bookItem of bookShelf) {
		const bookElement = makeBook(bookItem);
		if (!bookItem.isComplete) uncompletedList.append(bookElement);
		else completedList.append(bookElement);
	}
});

function makeBook(bookObject) {
	const txtTitle = document.createElement("h3");
	txtTitle.innerText = bookObject.title;

	const textAuthor = document.createElement("h4");
	textAuthor.innerText = "Penulis : " + bookObject.author;

	const txtYear = document.createElement("p");
	txtYear.innerText = "Tahun : " + bookObject.year;

	// const shadow = document.createElement("div");
	// shadow.classList.add("container-card");

	const action = document.createElement("div");
	action.classList.add("action");

	const container = document.createElement("div");
	container.classList.add("dataBook");
	container.append(txtTitle, textAuthor, txtYear, action);
	// shadow.append(action);

	action.setAttribute("id", `book-${bookObject.id}`);
	const imgRemove = document.createElement("img");
	imgRemove.src = "assets/trash.png";

	if (bookObject.isComplete) {
		const imgMove = document.createElement("img");
		imgMove.src = "assets/sync.png";
		const notFinishButton = document.createElement("button");
		notFinishButton.classList.add("move");
		notFinishButton.append(imgMove);

		notFinishButton.addEventListener("click", function () {
			undoTaskFromCompleted(bookObject.id);
			moveToast();
		});

		const removeButton = document.createElement("button");
		removeButton.classList.add("remove");
		removeButton.append(imgRemove);

		removeButton.addEventListener("click", function () {
			removeTaskFromCompleted(bookObject.id);
			delToast();
		});

		action.append(notFinishButton, removeButton);
	} else {
		const trashButton = document.createElement("button");
		trashButton.classList.add("remove");
		trashButton.append(imgRemove);

		trashButton.addEventListener("click", function () {
			removeTaskFromCompleted(bookObject.id);
			delToast();
		});
		const finishImg = document.createElement("img");
		finishImg.src = "assets/check-mark.png";
		const finishButton = document.createElement("button");
		finishButton.classList.add("move");
		finishButton.append(finishImg);

		finishButton.addEventListener("click", function () {
			addTaskToCompleted(bookObject.id);
			moveToast();
		});

		action.append(finishButton, trashButton);
	}
	return container;
}

function addTaskToCompleted(bookId) {
	const bookTarget = findBook(bookId);

	if (bookTarget == null) return;

	bookTarget.isComplete = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function undoTaskFromCompleted(bookId) {
	const bookTarget = findBook(bookId);

	if (bookTarget == null) return;

	bookTarget.isComplete = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function findBook(bookId) {
	for (const bookItem of bookShelf) {
		if (bookItem.id === bookId) {
			return bookItem;
		}
	}
	return null;
}

function removeTaskFromCompleted(bookId) {
	const bookTarget = findBookIndex(bookId);

	if (bookTarget === -1) return;

	bookShelf.splice(bookTarget, 1);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function findBookIndex(bookId) {
	for (const index in bookShelf) {
		if (bookShelf[index].id === bookId) {
			return index;
		}
	}

	return -1;
}

function isStorageExist() /* boolean */ {
	if (typeof Storage === undefined) {
		alert("Browser kamu tidak mendukung local storage");
		return false;
	}
	return true;
}

function saveData() {
	if (isStorageExist()) {
		const parsed = JSON.stringify(bookShelf);
		localStorage.setItem(STORAGE_KEY, parsed);
		document.dispatchEvent(new Event(SAVED_EVENT));
	}
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKS_APPS";

function loadDataFromStorage() {
	const serializedData = localStorage.getItem(STORAGE_KEY);
	let data = JSON.parse(serializedData);

	if (data !== null) {
		for (const book of data) {
			bookShelf.push(book);
		}
	}

	document.dispatchEvent(new Event(RENDER_EVENT));
}

function delToast() {
	const removeToast = document.getElementById("removeToast");
	removeToast.innerText = "Berhasil menghapus item";
	removeToast.className = "show";
	setTimeout(function () {
		removeToast.className = removeToast.className.replace("show", "");
	}, 1000);
}

function moveToast() {
	let moveToast = document.getElementById("moveToast");
	moveToast.innerText = "Berhasil memindahkan item";
	moveToast.className = "show";
	setTimeout(function () {
		moveToast.className = moveToast.className.replace("show", "");
	}, 1000);
}

function searchData() {
	let input, filter, table, dataBook, h3, txtValue, form, incompBook, compBook;
	incompBook = document.getElementById("incomplete-book");
	compBook = document.getElementById("complete-book");
	form = document.getElementById("formInput");
	input = document.getElementById("searchInput");
	filter = input.value.toUpperCase();
	table = document.getElementById("incompleteBookshelfList");
	dataBook = table.getElementsByTagName("div");
	for (let i = 0; i < dataBook.length; i++) {
		h3 = dataBook[i].getElementsByTagName("h3")[0];
		if (h3) {
			txtValue = h3.textContent || h3.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				dataBook[i].style.display = "";
				form.style.display = "";
				incompBook.style.display = "";
			} else {
				dataBook[i].style.display = "none";
				form.style.display = "none";
				incompBook.style.display = "none";
			}
		}
	}
	// form = document.getElementById("formInput");
	tableComplete = document.getElementById("completeBookshelfList");
	dataBook = tableComplete.getElementsByTagName("div");
	for (let i = 0; i < dataBook.length; i++) {
		h3 = dataBook[i].getElementsByTagName("h3")[0];
		if (h3) {
			txtValue = h3.textContent || h3.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				dataBook[i].style.display = "";
				compBook.style.display = "";
			} else {
				dataBook[i].style.display = "none";
				form.style.display = "none";
				compBook.style.display = "none";
			}
		}
	}
}

// const btnSearch = document.getElementById("searchSubmit");
// btnSearch.addEventListener("click", (event) => {
//   searchData();
// });

// const search = document.getElementById("searchBookTitle");
// search.addEventListener("keyup", (event) => {
//   if (event.key === "Enter") {
//     searchData();
//   }
// });
