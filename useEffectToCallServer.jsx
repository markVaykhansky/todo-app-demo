import { useEffect, useState } from "react";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class RemoteChatServer {
    static loggedInUsers = [];

    static async logIn(userName) {
        console.log("Logging in " + userName);
        
        RemoteChatServer.loggedInUsers.push(userName);
        await sleep(3000); // Sleep 10 seconds
    }
}


export function Chat(props) {
    const { userName } = props;
    const [status, setStatus] = useState('offline');

    useEffect(() => {
        const fetchNonChangingValue = async () => {
            await RemoteChatServer.logIn(userName);
            setStatus("online");
        };

        fetchNonChangingValue();
    }, []);

    return (
    <div>
        {status === 'online' ? 
        <div style={{color: "green"}}>{userName} is online</div> :
        <div style={{color: "orange"}}>{userName} is connecting</div>}
    </div>);
}