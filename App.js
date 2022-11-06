import './App.css';
import { useEffect, useState } from 'react';
import { MyComponent } from './use-effect-example-1';
import { Chat } from './useEffectToCallServer';

// 1. Create a username inside the App component
// 2. Authenticate the user through the App component
//  2.1. Once authenticated let the ToDo list component know 
//  2.2. Print a "sync" logo that means that the to-do list is syncing
// 3. After an item is added sync it to the server through a callback 

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ToDoListServer { 
  constructor() {
    this.userToAuth = {};
    this.userToTasks = {
      'Mark': [
        'Buy Milk',
        'Buy groceries',
        'Go to the gym',
        'Work',
        'Teach',
        'Study'
      ]
    }
  }

  async getUserAuthentication(user) {
    sleep(2000);
    
    function generateUserToken() {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < 10; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

    if(this.userToAuth[user] !== undefined) {
      return this.userToAuth[user];
    }

    const userAuth = generateUserToken();
    this.userToAuth[user] = userAuth;

    return {
      userAuth,
      userName: user
    };
  }

  async addUserTask(credentials, task) {
    this._validateCredentials(credentials);
    const { userName } = credentials;

    console.log("Adding task " + task + " to user " + userName);

    if(this.userToTasks[userName] === undefined) {
      this.userToTasks[userName] = [];
    }

    this.userToTasks[userName].push(task);
  }

  async getUserTasks(credentials) {
    this._validateCredentials(credentials);

    return this.userToTasks[credentials.userName];
  }

  _validateCredentials(credentials) {
    const { userName, userAuth } = credentials;

    sleep(2000);

    if(this.userToAuth[userName] !== userAuth) {
      throw new Error("User is not authenticated");
    }
  }
}

const toDoListServer = new ToDoListServer();

function ToDoListItem (props) {
  const { itemText, onDeleteItemHandler } = props;
  const [isItemChecked, setIsItemChecked] = useState(false);

  const onCheckboxChanged = () => {
    setIsItemChecked(!isItemChecked);
  }
  const checkboxStyle = isItemChecked ? { textDecoration: 'line-through' } : {}

  return (
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <div style={checkboxStyle}>{itemText}</div>
    <input type="checkbox" onChange={onCheckboxChanged}></input>
    <button onClick={() => onDeleteItemHandler(itemText)}>Delete</button>
  </div>
  );
}

function TaskList(props) {
  const { inSync, user, onItemAddedCallback, preExistingUserTasks } = props;

  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  const onAddItemClicked = () => {
    onItemAddedCallback(input);
    setTasks([...tasks, input]);
    setInput('');
  }

  useEffect(() => {
    setTasks([...tasks, ...preExistingUserTasks]);
  }, [preExistingUserTasks]);

  const onInputChangeMethod = (eventArgs) => {
    const currentInput = eventArgs.target.value;
    setInput(currentInput);
  }

  const onDeleteItem = (itemIndex) => {
    const toDoItemsDuplicate = [...tasks]
    toDoItemsDuplicate.splice(itemIndex, 1);
    setTasks(toDoItemsDuplicate);
  }

  const isEmptyToDoList = tasks.length === 0;
  

  return (<div>
    <h1>{user}'s ToDo List</h1>
    <h2 style={{color: inSync ? "green" : "orange"}}>{inSync ? "Connected" : "Is syncing..."}</h2>
    <input id="my-input" onChange={onInputChangeMethod} value={input} />
    <button onClick={onAddItemClicked}>Add Task</button>
    <div id="Items">
      {isEmptyToDoList ? <div>No Tasks</div> :
       tasks.map((item, index) => (
        <ToDoListItem 
          key={index} 
          itemText={item} 
          onDeleteItemHandler={onDeleteItem} />
      ))}
    </div>
  </div>)
}

function App() {
  const user = 'Mark';
  const [userCredentials, setUserCredentials] = useState(undefined);  
  const [preExistingUserTasks, setPreExistingUserTasks] = useState([]);

  useEffect(() => {
    const authenticateUser = async () => {
      const userCredentials = await toDoListServer.getUserAuthentication(user);
      console.log("Received a user credentials for " + user, userCredentials);
      setUserCredentials(userCredentials);
    }
    authenticateUser();
  }, []);

  useEffect(() => {
    if(!userCredentials) return;

    const fetchUserTasksFromServer = async () => {
        const userTasks = await toDoListServer.getUserTasks(userCredentials);
        setPreExistingUserTasks(userTasks);
    };
    fetchUserTasksFromServer();
  }, [userCredentials]);

  const addTaskToServer = (taskText) => {
    if(userCredentials === undefined) 
     return;

    if (taskText === undefined)
      return;

    if (user === undefined)
      return;

    toDoListServer.addUserTask(userCredentials, taskText);
  }

  const inSync = !!userCredentials;

  return (
    <div style={{ backgroundColor: '#0190FE', height: '100vh' }} className="App">
      <TaskList 
        user={user}
        inSync={inSync}
        onItemAddedCallback={addTaskToServer} 
        preExistingUserTasks={preExistingUserTasks}
        />
    </div>
  
  );
}

export default App;

