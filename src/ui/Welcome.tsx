import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useHotkeys } from "react-hotkeys-hook"

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
        if(data.error){ 
            setError(null)
            setError(data.error)
            keyVal.current?.focus()
        }
        else nav('/main-page')
    }
    useHotkeys("shift+ctrl+l", () => {
        allowed();
    }, { preventDefault: true });
    // useHotkeys("ctrl+shift+f", () => {keyVal.current?.focus()}, {preventDefault: true})
    const [ff, setFF] = useState<boolean|null>()
    useEffect(() => {
        keyVal.current?.focus()
        // if(keyVal.current?.value.length === 4) keyVal.current?.blur();
        //@ts-ignore
        window.electron.listenerFocus(() => keyVal.current?.focus())
        //@ts-ignore
        window.electron.ffmpegStatus()
        //@ts-ignore
        window.electron.ffRecieve((data) => setFF(data))
        //@ts-ignore
        window.electron.hardwareId().then((response) => {
            setResponse(response)
            
        })
        
    }, [])
 
    
    return (<div className="w-screen h-screen flex flex-col  justify-center items-center">
        <div className="p-4 "> <b> ENTER KEY</b></div>
        <input ref={keyVal} onChange={() => {if(keyVal.current?.value.length === 4) keyVal.current?.blur();}} className="border-2 border-black text-center w-[50%] px-2 py-2" type="text" placeholder="xxxx" />
        {ff ? ff == true ? <> </> : <> Run <code> winget install ffmpeg </code> in your terminal</> : ""}
        <button onClick={allowed} className="w-[30%] px-4 py-2 m-4 bg-black rounded-2xl text-white">Submit</button>
        <div> <span className="text-red-600">Note: </span>you will not be able to log in from any other device</div>
        <div className="text-red-600">{error ? error : null}</div>
    </div>)
}