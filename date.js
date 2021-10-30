
 exports.getData=()=>{
    const today = new Date();
    
    const Options ={
        weekday: "long",
        day: "numeric",
        month: "long"
    }      
    const day = today.toLocaleString("en-IN", Options);

    return day;
}
