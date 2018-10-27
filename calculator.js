// At the start we will use jQuery to detect if document is ready or not

$(document).ready(function()    {

// An array of symbols and functions of every operand. Order of operators works out precedence
    
    var operators = [

        {
        id: "op-power",
        numOperands: 2,
        symbol: "^",
        calc: function (a,b)  {
            return Math.pow(a,b);
            }        
        },

        {
        id: "op-sin",
        numOperands: 1,
        symbol: "sin",
        calc: function (a)  {
            return Math.sin(a);
            }        
        },

        {
        id: "op-cos",
        numOperands: 1,
        symbol: "cos",
        calc: function (a)  {
            return Math.cos(a);
            }        
        },

        {
        id: "op-tan",
        numOperands: 1,
        symbol: "tan",
        calc: function (a)  {
            return Math.tan(a);
            }        
        },

        {
        id: "multiply",
        numOperands: 2,
        symbol: "x",
        calc: function (a,b)  {
            return a * b;
            }        
        },

        {
        id: "divide",
        numOperands: 2,
        symbol: "/",
        calc: function (a,b)  {
            return a / b;
            }        
        },

        {
        id: "add",
        numOperands: 2,
        symbol: "+",
        calc: function (a,b)  {
            return a + b;
            }        
        },
    
        {
        id: "subtract",
        numOperands: 2,
        symbol: "-",
        calc: function (a,b)  {
            return a - b;
            }        
        },
    ];

    // Number of decimal places to round to for either input or result
    const roundPlaces = 7;

    // Use operators array to get operator object for a given operator ID
    function getOperator (opID)  {
        for (var i = 0; i < operators.length; i++)  {
            if (operators[i].id === opID)    {
                return operators[i];
            }
        }
        return undefined;
    }

    // Again use operators array to get precedence of an operator given its ID
    function getOpPrecedence (opID) {
        for (var i = 0; i < operators.length; i++)   {
            if (operators[i].id === opID)    {
                return i;
            }
        }
        // If given ID does not return an operator, then return a large value like 1000, that loses precedence
        return 1000;
    }

    // If op1 ID has equal or higher precedence than op2 ID then return true, otherwise return false.
    function hasPrecedence(op1, op2)    {
        if (getOperator(op1)!= undefined)   {
            return getOpPrecedence (op1) <= getOpPrecedence (op2);
        }
    }


    // Converts given radian value to degrees
    function toDegrees (radians)    {
        return radians * (180 / Math.PI);
    }

    //Converts given degree values to radians
    function toRadians (degrees)    {
        return degrees * (Math.PI / 180);
    }


    // A list of every token (number or operator) currently in expression
    var tokenList = [];

    // A list of previous results and expressions in this sequence {out: output, expression: expression string, tokens: list of tokens in expression} 
    var calcHistory = [];


    // Evaluates expression and outputs result
    function calculate()    {
    // check if brackets are balanced

    var count = 0
        
        for (var i = 0; i < tokenList.length; i++)  {
            if(tokenList[i] === "left-brac") {
                count++;
            }   else if (tokenList[i] === "right-brac")   {
                count--;
            }           
        }
    if (count !=0)  {
        output ("Error: unbalanced brackets");
        return;
    }
        
    // Evaluate expression based on modern shunting yard algorithm

    var valStack = [];
    var opStack = [];
    
    for (var i = 0; i < tokenList.length; i++)  {
        if (!isNaN(tokenList[i]))   {
            valStack.push(tokenList[i]);

        }   else if (tokenList[i] === "num-pi")   {
            valStack.push(Math.PI);            

        }   else if (tokenList[i] === "left-brac")   {
            opStack.push(tokenList[i]);
            
        }   else if (tokenList[i] === "right-brac") {

            while (opStack [opStack.length - 1]!== "left-brac")  {
                var operator = getOperator (opStack.pop());
                if (operator.numOperands === 1)
                    valStack.push (applyOperator(operator, [valStack.pop()]));
                else
                    valStack.push(applyOperator(operator, [valStack.pop(), valStack.pop()]));    
                }
                opStack.pop();

            }   else    {
            while (opStack.length > 0 && hasPrecedence(opStack[opStack.length - 1], tokenList[i]))  {
                var operator = getOperator (opStack.pop());
                if (operator.numOperands === 1)
                    valStack.push(applyOperator (operator, [valStack.pop()]));
                else 
                    valStack.push(applyOperator(operator, [valStack.pop(), valStack.pop()]));     
                } 
                opStack.push(tokenList[i]);
            } 
        }

        while (opStack.length > 0)  {
            var operator = getOperator (opStack.pop());
            if (operator.numOperands === 1)
                valStack.push(applyOperator(operator, [valStack.pop()]));
            else
                valStack.push(applyOperator(operator, [valStack.pop(), valStack.pop()]));
            }
        
            // Output calculated result and original expression
            output(valStack[0], $("#expression").html(), tokenList);
        }    

    // function that finds result from applying unary (operate on single operand) or binary operator (operates on two operands) on top values of value stack
    function applyOperator(operator, vals)  {
        var valA = vals[0];
        var output;

        if (vals.length === 1)  {
            output = operator.calc (parseFloat(valA));
        }   else    {
            var valB = vals[1];
            output = operator.calc (parseFloat(valB), parseFloat(valA));
        }

        return output;
    }

    // Updates equation and calc history with given output
    function output (out, expression, tokens)   {
        out = +out.toFixed(roundPlaces);
        $ ("#expression").html(out.toString());

        calcHistory.push({out: out, expression: expression, tokens: tokens});

        $("#calc-history-box").html("");
            for (var i = calcHistory.length - 1; i >= 0; i-- )  {

        $("#calc-history-box").append("<p style='color: #B0B0B0;' class='calc-history-eq' id= 'eq" + i + "'>" + 
        calcHistory[i].expression + "</p> <p style = 'text-align: right; margin-top: -10px;'>= " + calcHistory[i].out + "</p>");
        }
    }    

    // Adds token to token list and updates display
    function addToken (token)   {
        if (isNaN(token))   {
        if ((token === "left-brac" || token === "num-pi") && !isNaN (tokenList [tokenlist.length - 1]) )    {
            token.List.push("multiply");
        }
            tokenlist.push(token);
    }   else    {
            if (!isNaN (tokenList [tokenList.length - 1] )) {
                tokenlist [tokenList.length - 1] = tokenList [tokenList.length -1] + token;
            }   else    {
                if (!isNaN (token) && (tokenList [tokenList.length -1] === "right-brac" || tokenList [tokenList.length - 1] === "num-pi"))  {
                    tokenList.push("multiply");
                }
                tokenList.push(token);
            }
        }
        displayEquation();
    }

    // Updates expression display's HTML
    function displayEquation()  {
        var htmlString = "";

        for (var i = 0; i < tokenList.length; i++)  {
            if (isNaN (tokenList[i]))   {
                if (tokenList[i] === "left-brac")   {
                    htmlString += "(";

                }   else if (tokenList[i] === "right-brac")  {
                    htmlString += ")";

                }   else if (tokenList[i] === "num-pi")  {
                    htmlString += "π";

                }   else    {
                        htmlString += getOperator (tokenList[i]).symbol;

                }  
            }   else    {
                    htmlString +=tokenList[i];
            }
        }
        $ ("#expression").html(htmlString);
    }

    // Deletes last entered token
    function clearLast()    {
        if (isNaN (tokenList [tokenList.length -1] ))   {
            tokenList.pop();
        }   else    {
            tokenList [tokenList.length -1] = tokenList [tokenList.length -1].slice(0, -1);

            if (tokenList [tokenList.length - 1].length === 0)  {
                tokenList.pop();
            }
        }
        displayEquation();        
    }

    // Control of On/Off button
    function onOff()    {
        currentvalue = document.getElementById('onoff').value;
        if(currentvalue == "Off")   {
            document.getElementById("onoff").value = "On";
        }   else    {
            document.getElementById("onoff").value = "Off";
        }
    }

    // Shows or hides advanced operators buttons
    function toggleAdvanced()   {
        $("#advanced-buttons").toggle();

        if ($ ("#advanced-buttons").is(":visible")) {
            $("#toggle-advanced").removeClass("button-off");
            $("#toggle-advanced span").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
        }   else    {
                $("#toggle-advanced").addClass("button-off");
                $("#toggle-advanced span").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");                            
        }
    }

    // Sorts out action for each button that can be pressed
    function processButton (button) {
        switch($(button).attr("id"))    {
            case "clear":
                clearLast();
                break;

            case "AC":
                if (tokenList.length === 0) {
                    calcHistory.length = 0;
                    $("#calc-history-box").html("");
                }   else    {
                    tokenList.length = 0;
                    displayEquation();
                }
                break;

            case "onoff":
                onOff();
                break; 
                
            case "decimal":
                if (isNaN(tokenList[tokenList.length - 1])) {
                    addToken("0.");
            }   else    {
                    if(tokenList[tokenList.length - 1].indexOf(".") === -1) {
                        tokenList[tokenList.length -1] += ".";
                    }
                }
                displayEquation();
                break;

            case "equals":
                calculate();
                break;
                
            case "toggle-advanced":
                toggleAdvanced();
                break;
                
            case "num-pi":
                addToken("num-pi");
                break;
                
            default:
                if ($(button).hasClass("num"))  {
                    addToken($(button).html());
            }    else   {
                    addToken($(button).attr("id"));
            }
        }
    }

    // Handles buttons clicks on page
    $(".btn").click(function(event)    {
        $(event.target).blur();
            processButton(event.target);
    });


    // function to create calculation history when user clicks on buttons
    $(document).on("click",".calc-history-eq", function(event)  {
        var tokens = calcHistory [parseInt($(event.target).attr("id").substring(2))].tokens;
        console.log (parseInt ($ (event.target).attr("id").substring(2)));
        console.log(calcHistory);
        console.log(tokens);
        tokenList = tokens;
        displayEquation();
        });
        
    });

