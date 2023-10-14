(()=>{
    let controls,player;
    let cv="";
    chrome.runtime.onMessage.addListener((obj,sender,response)=>{
        const { type,value,vId}=obj;

        if(type==="NEW"){
            cv=vId;
            newVideoLoaded();
        }
    })
})