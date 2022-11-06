import { useEffect, useState } from "react";

export function MyComponent(props) {
    const { someProp } = props;
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        console.log("Only on mount");
    }, []);

    useEffect(() => {
        console.log('Every Render Effect');
    });

    useEffect(() => {
        console.log("Counter has changed " + counter);
    }, [counter]);

    useEffect(() => {
        console.log("Some prop has changed " + someProp)
    }, [someProp]);

    useEffect(() => {
        console.log("Either someProp or counter has changed");
    }, [someProp, counter]);
    
    return (
    <div>
        <div>Some Prop</div>
        <div>{someProp}</div>
        <div>{counter}</div>
        <button onClick={() => setCounter(counter + 1)}>Increase Counter</button>
    </div>);
}