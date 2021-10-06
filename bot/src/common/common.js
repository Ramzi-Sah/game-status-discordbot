function sleep(milliseconds) {
    return new Promise((resolve) => {
		setTimeout(() => {
				resolve();
			},
			milliseconds
		)
	});
};

function generateID() {
	var result = '';

	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < 15; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	};

	return result;
};

function hexToRgb(hex, opacity) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? "rgba(" + parseInt(result[1], 16) + ", " + parseInt(result[2], 16) + ", " + parseInt(result[3], 16) + ", " + opacity + ")" : null;
}

module.exports = {
	sleep: sleep,
	generateID : generateID,
	hexToRgb: hexToRgb
};