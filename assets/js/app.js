const cl = console.log;

const form = document.getElementById('form')
const todoItem = document.getElementById('todoItem')
const addTodo = document.getElementById('addTodo')
const updateTodo = document.getElementById('updateTodo')
const spinner = document.getElementById('spinner')
const todoContainer = document.getElementById('todoContainer')


const base_url = 'https://bhagyashri-s-first-database-default-rtdb.firebaseio.com/'
const todo_url = `${base_url}/todos.json`

let state = {
    todoArr: [],
    editId: null
}


//spinner function

function handleSpinner(flag) {
    if (flag) {
        spinner.classList.remove('d-none')
    } else {
        spinner.classList.add('d-none')
    }
}

// snackbar function

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}

//generic function

function makeApiCall(url, methodName, body) {
    return fetch(url, {
        method: methodName,
        body: body ? JSON.stringify(body) : null,
        header: {
            "content-type": "application/json",
            "auth": "JWT token"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("http : error")
            }
            return res.json()
        })
}


makeApiCall(todo_url, "GET")
    .then(data => {
        cl(data)
        for (const key in data) {
            data[key].id = key
            state.todoArr.push(data[key])
        }
        renderonUI(state.todoArr)
    })
    .catch(err => {
        snackbar(`something went wrong while fetching the data`, 'error')
    })
    .finally(() => {
        handleSpinner()
    })

function renderonUI(arr) {
    handleSpinner(true)
    let res = '';

    arr.forEach(ele => {
        res += `<li class="list-group-item d-flex justify-content-between" id="${ele.id}">
                                <strong>${ele.todo}</strong>

                                <div>
                                    <button onclick="onEdit(this)" type="button" class="btn btn-sm btn-success">Edit</button>
                                    <button onclick="onDelete(this)" type="button" class="btn btn-sm btn-danger">Remove</button>
                                </div>
                            </li>`
    });
    todoContainer.innerHTML = res
}




function onSubmit(eve) {
    eve.preventDefault();

    let newTodo = {
        todo: todoItem.value,
    }
    handleSpinner(true)
    makeApiCall(todo_url, "POST", body = newTodo)
        .then(data => {
            newTodo.id = data.name
            state.todoArr.push(newTodo)
            form.reset()

            let li = document.createElement("li")
            li.id = data.name
            li.className = "list-group-item d-flex justify-content-between"
            li.innerHTML = `<strong>${newTodo.todo}</strong>
    
                                    <div>
                                        <button onclick="onEdit(this)" type="button" class="btn btn-sm btn-success">Edit</button>
                                        <button onclick="onDelete(this)" type="button" class="btn btn-sm btn-danger">Remove</button>
                                    </div>`
            todoContainer.append(li)
            snackbar(`new todo with name ${newTodo.todo} created successfully`, 'success')
        }).catch(err => {
            snackbar('something ')
        })
        .finally(() => {
            handleSpinner()
        })

}

function onDelete(ele) {
    let deleteId = ele.closest('li').id;
    // cl(deleteId)

    let delete_url = `${base_url}/todos/${deleteId}.json`

    makeApiCall(delete_url, "DELETE", body)
        .then(data => {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            }).then((result) => {
                if (result.isConfirmed) {
                    handleSpinner(true)
                    let index = state.todoArr.findIndex(e => e.id === deleteId)
                    state.todoArr.splice(index, 1)
                    ele.closest('li').remove()

                    snackbar(`todo with id ${deleteId} deleted successfully`, 'success')
                }
            }).catch(err => {
                snackbar('something went wrong while deleting the data', 'error')
            })
            .finally(() => {
                handleSpinner()
            })
        })
}


function onEdit(ele) {
    let editId = ele.closest('li').id;
    // cl(editId)

    state.editId = editId

    let editObj = state.todoArr.find(e => e.id === editId)
    // cl(editObj)

    todoItem.value = editObj.todo

    addTodo.classList.add('d-none')
    updateTodo.classList.remove('d-none')
}


function onUpdate() {
    let updateId = state.editId
    // cl(updateId)

    let update_url = `${base_url}/todos/${updateId}.json`

    let updateObj = {
        todo: todoItem.value,
        id: updateId
    }

    makeApiCall(update_url, "PATCH", body = updateObj)
        .then(data => {
            handleSpinner(true)
            let index = state.todoArr.findIndex(e => e.id === updateId)
            state.todoArr[index] = updateObj

            let li = document.getElementById(updateId)
            li.querySelector('strong').innerText = updateObj.todo

            snackbar(`todo with name ${updateObj.todo} updated successfully`, 'success')

            form.reset()

            addTodo.classList.remove('d-none')
            updateTodo.classList.add('d-none')
        })
        .catch(err => {
            snackbar('something went wrong while updating the todo', 'error')
        })
        .finally(() => {
            handleSpinner()
        })
}


form.addEventListener('submit', onSubmit)
updateTodo.addEventListener('click', onUpdate)





