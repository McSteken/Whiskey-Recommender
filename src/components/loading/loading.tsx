import React, {useState, useEffect} from 'react'
import Spinner from './spinner'

export default function loading() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000);
        return () => {
            clearTimeout(timer);
        }
    }, []);
  return (
    <div className = "spinner">
        <Spinner />
    </div>  )
}
