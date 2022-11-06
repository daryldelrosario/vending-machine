/*
Creator: Daryl del Rosario
Date Created: Sunday, July 10, 2022 @ 237am
Most Recent Revision: Wednesday, July 13, 2022 @ 810pam
*/
const _webService = "http://vending.us-east-1.elasticbeanstalk.com";
var userMoney = 0.0;

$(document).ready(function() {
	loadItems();
});

// Function: Displaying All Items
function loadItems() {
	clearItems();
	var itemContents = $("#itemWrapper");
	
	$.ajax({
		type: "GET",
		url: _webService + "/items",
		success: function(itemArray) {
			$.each(itemArray, function(index, item) {
				// Actual Item
				var idActual = item.id;
				var name = item.name;
				var priceActual = item.price;
				var quantity = item.quantity;
				
				// Display Item
				var idDisplay = index + 1;
				var priceDisplay = "$ " + item.price.toFixed(2);
				var quantityDisplay = "Quantity Left: " + item.quantity;
				
				var test = "$ Dollar Bill Yo";
				
				// Dynamic Data
				var row = "<div class='itemBox' id='itemBox'>";
				row += "<div class='itemInfo"+ idDisplay +"' id='"+ name +"' onclick='selectItemDisplay("+ idDisplay +", "+ idActual +" , "+ priceActual +")'>";
				row += "<p id='itemId'>" + idDisplay + "</p>";
				row += "<p id='itemName'>" + name + "</p>";
				row += "<p id='itemPrice'>" + priceDisplay + "</p>";
				row += "<p id='itemQuantity'>" + quantityDisplay + "</p>";
				row += "</div>";
				row += "</div>";
				
				itemContents.append(row);
			})
			
		},
		error: function() {
			var msg = "Error calling web service.&#13;&#10;Please check URL and try again.";
			var color = "lightpink";
			showMessage(msg, color, "bold");
		}
	})
}

// Function: Select and Display Single Item
function selectItemDisplay(idDisplay, idActual, priceActual) {
	var title = "===== Item Description =====";
	var displayName = "[Name] " + $(".itemInfo" + idDisplay).attr("id");
	var displayPrice = "[Price] $" + priceActual.toFixed(2);
	var inputMsg = title + "&#13;&#10" + displayName + "&#13;&#10" + displayPrice;
	showMessage(inputMsg, "white", "normal");
	
	// Display Item Id
	$("#inputItem").css("background-color", "white");
	$("#inputItem").val(idDisplay);
	
	// Store Item Id, Price, Name in Hidden Storage for Potential Later Use
	$("#actualItemId").val(idActual);
	$("#actualItemPrice").val(priceActual.toFixed(2));
	$("#actualItemName").val(displayName);
	
	// Turn Money On and Default Change Form
	turnOnMoney();
	defaultChange();
}

// Function: Vending Selected Item
function purchaseItem() {
	var displayId = $("#inputItem").val();
	var actualId = $("#actualItemId").val();
	var amount = $("#inputMoney").val();
	var price = $("#actualItemPrice").val();
	var changeAmount = (amount - price).toFixed(2);
	
	// When No Deposit, Error Message to Deposit Full Price
	if(amount == "") {
		amount = 0;
	}
	
	// When No Item Selected, Error Message to Make Item Selection
	if(displayId == "") {
		var title = "======= Error =======";
		var desc = "No Item Has Been Selected";
		var msg = "Please make a selection.";
		var errorMsg = title + "&#13;&#10" + desc + "&#13;&#10" + msg;
		showMessage(errorMsg, "lightpink", "bold");
		
		turnOnMoney();
		defaultChange();
	} else {
		// Run Endpoint for Vending Item
		$.ajax({
			type: "POST",
			url: _webService + "/money/" + amount + "/item/" + actualId,
			data:"",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			"dataType": "json",
			success: function(change) {
				purchaseChange(change);
			
				var title = "=== Thank You For Buying Item: " + displayId + " ===";
				var deposit = "Deposit $" + amount + " | Change $" + changeAmount;
				var msg = "Please collect your change below.";
				var thisMsg = title + "&#13;&#10" + deposit + "&#13;&#10" + msg;
				showMessage(thisMsg, "lightgreen", "bold");
			
				showCollectChange();
				defaultItemDisplay();
				loadItems();
				turnOffMoney();
			},
			error: function(error) {
				var title = "======= Error =======";
				var errorMsg = error.responseJSON.message;
				var inputMsg = title + "&#13;&#10" + errorMsg;
				showMessage(inputMsg, "lightpink", "bold");
			}
		})
	}
}

// Customisation and Helper Functions
// Function: Message Handling
function showMessage(msg, color, fontWeight) {
	$("#displayMessage").html(msg);
	$("#displayMessage").css({"background-color":color, "font-weight":fontWeight});
}

// Function: Toggle Between Coins and Bills
function toggle() {
	if($("#addBillButtons").is(":hidden")) {
		$("#addCoinButtons").hide("fast");
		$("#addBillButtons").show("slow");
		$("#toggleCoinBill").text("[ Toggle - Insert Coins ]");
	} else {
		$("#addCoinButtons").show("slow");
		$("#addBillButtons").hide("fast");
		$("#toggleCoinBill").text("[ Toggle - Insert Bills ]");
	}
}

// Functions for Money Collection
function addFiveCents() {
	userMoney += 0.05;
	$("#inputMoney").val(userMoney.toFixed(2));
}

function addTenCents() {
	userMoney += 0.10;
	$("#inputMoney").val(userMoney.toFixed(2));
}

function addTwentyFiveCents() {
	userMoney += 0.25;
	$("#inputMoney").val(userMoney.toFixed(2));
}

function addOneDollar() {
	userMoney += 1.00;
	$("#inputMoney").val(userMoney.toFixed(2));
}

function addTenDollars() {
	userMoney += 10.00;
	$("#inputMoney").val(userMoney.toFixed(2));
}

function addTwentyDollars() {
	userMoney += 20.00;
	$("#inputMoney").val(userMoney.toFixed(2));
}

function addFiftyDollars() {
	userMoney += 50.00;
	$("#inputMoney").val(userMoney.toFixed(2));
}

function addHundredDollars() {
	userMoney += 100.00;
	$("#inputMoney").val(userMoney.toFixed(2));
}

// Function: Calculate Change from Return
function returnChange() {
	var startMoney = $("#inputMoney").val();
	var collectedMoney = $("#inputMoney").val();
	
	if(collectedMoney == "") {
		alert("No money was collected. \nWe've reset the Vending Machine. \nPlease try again.");
		location.reload();
	} else {
		// Calculate and Display Change from Collected Money
		var quarterStr = "";
		var dimeStr = "";
		var nickelStr = "";
		var pennyStr = "";
		
		var quarters = Math.floor(collectedMoney / 0.25);
		var change = (0.25 * quarters);
		collectedMoney = (collectedMoney - change).toFixed(2);
		
		var dimes = Math.floor(collectedMoney / 0.10);
		change = (0.10 * dimes);
		collectedMoney = (collectedMoney - change).toFixed(2);
		
		var nickels = Math.floor(collectedMoney / 0.05);
		change = (0.05 * nickels);
		collectedMoney = collectedMoney - change;
		
		var pennies = collectedMoney;
			
		if(quarters == 1) {
			quarterStr = "quarter";
		} else {
			quarterStr = "quarters";
		}
		
		if(dimes == 1) {
			dimeStr = "dime";
		} else {
			dimeStr = "dimes";
		}
		
		if(nickels == 1) {
			nickelStr = "nickel";
		} else {
			nickelStr = "nickels";
		}
		
		if(pennies == 1) {
			pennyStr = "penny";
		} else {
			pennyStr = "pennies";
		}
		
		var displayChange = quarters + " " + quarterStr + ", " + dimes + " " + dimeStr + ", " + nickels + " " + nickelStr + ", " + pennies + " " + pennyStr;
		$("#displayChange").html(displayChange);
		
		// Reset Money in Collection
		resetMoneyDisplay();
		
		// Display Error Message for Abandoned Transaction		
		var title = "=== Transaction Abandoned ===";
		var deposit = "Deposit Amount $" + startMoney;
		var msg = "Please collect your change below."; 
		var showThis = title + "&#13;&#10" + deposit + "&#13;&#10" + msg;
		showMessage(showThis, "lightPink", "bold");
		
		// Default Item Display, Show Collect Change Button and Disable Money Input
		defaultItemDisplay();
		showCollectChange();
		turnOffMoney();
	}
}

// Function: Collect Change
function collectChange() {
	turnOnMoney();
	defaultMessageItem();
	defaultChange();
}

// Function: Calculate Change from Purchase
function purchaseChange(change) {
	var quarters = change.quarters;
	var dimes = change.dimes;
	var nickels = change.nickels;
	var pennies = change.pennies;
	
	var quarterStr = "";
	var dimeStr = "";
	var nickelStr = "";
	var pennyStr = "";
	
	if(quarters == 1) {
		quarterStr = "quarter";
	} else {
		quarterStr = "quarters";
	}
	
	if(dimes == 1) {
		dimeStr = "dime";
	} else {
		dimeStr = "dimes";
	}
	
	if(nickels == 1) {
		nickelStr = "nickel";
	} else {
		nickelStr = "nickels";
	}
	
	if(pennies == 1) {
		pennyStr = "penny";
	} else {
		pennyStr = "pennies";
	}
	
	var displayChange = quarters + " " + quarterStr + ", " + dimes + " " + dimeStr + ", " + nickels + " " + nickelStr + ", " + pennies + " " + pennyStr;
	$("#displayChange").html(displayChange);
		
	resetMoneyDisplay();
}

// Function: Clear List of Items for Update
function clearItems() {
	$("#itemWrapper").empty();
}

// Functions to Default Page
// Functions to Default Total $ In Form
function turnOnMoney() {
	$(".toggle").attr("disabled", false);
}

function turnOffMoney() {
	$(".toggle").attr("disabled", true);
}

function resetMoneyDisplay() {
	$("#inputMoney").val("");
	userMoney = 0.0;
}

function defaultMoneyIn() {
	turnOnMoney();
	resetMoneyDisplay();
}

// Functions to Default Message and Item Form
function defaultItemDisplay() {
	$("#inputItem").val("");
	$("#inputItem").css("background-color", "");
}

function defaultMessageItem() {
	showMessage("", "", "normal");
	defaultItemDisplay();
}

// Functions to Default Change Form
function showReturnChange() {
	$("#changeButton").show();
	$("#collectButton").hide();
}

function showCollectChange() {
	$("#changeButton").hide();
	$("#collectButton").show();
}

function defaultChange() {
	$("#displayChange").html("");
	showReturnChange();
}

// Function: Turn Page to Default Settings	
function defaultPage() {
	defaultMoneyIn();
	defaultMessageItem();
	defaultChange();
}