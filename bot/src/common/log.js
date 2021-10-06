function print(msg, type = 0, from = "") {
    // message type
    let strType = "";
    switch(type) {
        case 0:
            strType = "INFO"
            break;
        case 1:
            strType = "WARNING"
            break;
        case 2:
            strType = "ERROR"
            break;
        default:
            strType = ""
    };

    // message from
    if (from != "") {
        from = " (" + from + ")";
    };
    

	console.log(
		new Date().toLocaleTimeString('en-US', {year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", seconds: "numeric"}) + " - " +
		"[" + strType + "]" + from + " - " +
		msg
	);
};

function printError(err, from = "") {
    // message from
    if (from != "") {
		from = " (" + from + ")";
    };
    
	console.error(
		from + " - " +
        err
	);
};

module.exports = {
    print: print,
    printError: printError
};