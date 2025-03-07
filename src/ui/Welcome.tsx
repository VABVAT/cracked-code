import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"


export default function Welcome(){
    const [respo, setResponse] = useState<string | null>()
    const keyVal = useRef<HTMLInputElement | null>(null)
    const [error, setError] = useState<string | null>();
    const nav = useNavigate() 
    async function allowed() {
        const re = await fetch("http://ec2-3-112-236-69.ap-northeast-1.compute.amazonaws.com:8112/userCheck", {
            method: "POST",
            headers:{ 'Content-Type': 'application/json'},
            body: JSON.stringify({
                //@ts-ignore
                key: String(keyVal.current?.value),
                id: String(respo)
            })
        }
        )
        const data = await re.json()
        console.log(data)
        if(data.error){ 
            setError(null)
            setError(data.error)
        }
        else nav('/main-page')
    }
    
    const [ff, setFF] = useState<boolean|null>()
    useEffect(() => {
        //@ts-ignore
        window.electron.ffmpegStatus()
        //@ts-ignore
        window.electron.ffRecieve((data) => setFF(data))
        //@ts-ignore
        window.electron.hardwareId().then((response) => setResponse(response))
        
    }, [])
    
    return (<div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="p-4 "> <b> ENTER KEY</b></div>
        
        <input ref={keyVal} className="border-2 border-black text-center w-[50%] px-2 py-2" type="text" placeholder="XXXX-XXXX-XXXX" />
        {ff ? ff == true ? <> </> : <> Run <code> winget install ffmpeg </code> in your terminal</> : ""}
        <button onClick={allowed} className="w-[30%] px-4 py-2 m-4 bg-black rounded-2xl text-white">Submit</button>
        <div> <span className="text-red-600">Note: </span>you will not be able to log in from any other device</div>
        <div className="text-red-600">{error ? error : null}</div>
    </div>)
}