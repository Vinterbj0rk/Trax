function createCard(cardType)
{
	var card = document.createElement("div");
	card.className = "card" + " card" + cardType;
	var d = new Date();
	card.id = "card" + d.getTime();
	var cardPicture = document.createElement("div");
	var cardName = document.createElement("div");
	cardPicture.className = "cardPicture";
	cardPicture.id = "pic"+card.id;
	cardName.className = "cardName";
	cardPicture.innerHTML = "[pic]";	
	cardName.innerHTML = "No Namae";	
	//
	var cardClose = document.createElement("div");
	cardClose.innerHTML = "<a href='#' onClick='return deleteThis(this);'><img class='cardCloseImage' src='./Close.jpg'</a>";
	cardClose.className = "cardCloseDiv";
	//

	$.ajax({
		url: 'https://randomuser.me/api/?inc=name,picture',
		async: false,
		dataType: 'json',
		success: function(data)
		{
			cardName.innerHTML = data.results[0].name.first + " " + data.results[0].name.last;
			cardPicture.innerHTML = "<img class='portrait' src='" + data.results[0].picture.thumbnail + "'>";
		}
	});

	card.appendChild(cardPicture);
	card.appendChild(cardName);
	card.appendChild(cardClose);
	
	cardPicture.setAttribute('onclick', 'changeIMG(event)');
	cardName.setAttribute('contentEditable', 'true');
	card.setAttribute('draggable', 'true');
	card.setAttribute('ondragstart', 'drag(event)');
	
	document.getElementById("output").appendChild(card);
}

function deleteThis(event)
{
		event.parentElement.parentElement.remove();
		console.log("Removed " + event.parentElement.parentElement.id);
}

function flipThis(thisFlip)
{
	if(thisFlip.getAttribute("class")=="notDone")
	{
		thisFlip.className = "isDone";
	}
	else
	{
		thisFlip.className = "notDone";
	}
}

function updateInitlist()
{
	$("#initlist").html("");
	$("#initlist").append("<ul class='nobullets'>");
	$( ".initbox" ).each(function( index )
	{
	  if($( this ).html() != "")
	  {
		  var initnumber = $(this).attr('title');
		  $( this ).find(".card").each(function( index )
		  {
				$("#initlist").find("ul").append("<li class='notDone' onclick='flipThis(this)'>" + initnumber + " " + $( this ).find(".cardName").html() +"</li>");  
		  });
	  }
	});
	$("#initlist").append("</ul>");
}

function copyInitlistToClipboard()
{
	if(listIsNotEmpty())
	{
		var toCopy = makeInitlistText();
		toCopy += "\n";
		toCopy += "at " + getTimestamp();
		console.log(toCopy);
		const el = document.createElement('textarea');
		el.value = toCopy;
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	}
}	

function saveInitlistImage()
{
	if(listIsNotEmpty())
	{
		makeInitlistImage();
		var canvas = document.getElementById("myCanvas");
		var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
		var filename = "Initiative" + getTimestamp() + ".png";
		var link = document.createElement('a');
		document.body.appendChild(link);
		link.download = filename;
		link.href = image;
		link.click();
		document.body.removeChild(link);
	}
}

function createDiscordImage()
{
	if(listIsNotEmpty())
	{
		//check the discord url
		var discordUrl = getDiscordLink();
		if (discordUrl == undefined || discordUrl == 'null' || discordUrl == "") 
		{
			throw new Error("No Discord Link Entered!");
		}
		//
		var initTable = [];
		$( ".initbox" ).each(function( index )
		{
		  if($( this ).html() != "")
		  {
			var initnumber = $(this).attr('title');
			var initname = $( this ).find(".cardName").html();
			$( this ).find(".card").each(function( index )
			{  
				initname = $( this ).find(".cardName").html();
				initTable.push({number:initnumber, name:initname});
			});
		  }
		});
		console.log(initTable);
		//Setup Canvas
		var canvas = document.getElementById("myCanvas");
		const context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
		var theCanvas = canvas.getContext("2d");
		//Generate the Graphics

		var boxImg = new Image();
		boxImg.setAttribute('crossOrigin', 'anonymous'); 
		boxImg.src = './discordBox.png';
		
		var boxHeight = 112;
		var boxWidth = 117;
		var boxSpacing = 4;
		var boxFontSizeLarge = 30;
		var boxFontSizeSmall = 16;
		
		var number = 25;
		
		for(var i = 0; i < 5; i++)
		{
			
			for(var j = 0; j < 5; j++)
			{
				//draw boxes and boxnumber
				theCanvas.drawImage(boxImg, j*(boxWidth+boxSpacing),i*(boxHeight+boxSpacing));
				theCanvas.font = "30px Arial";
				theCanvas.fillStyle = "#808080";
				theCanvas.fillText(number,((j*(boxWidth+boxSpacing))+(boxSpacing*2))/*+(boxWidth/2)*/,i*(boxHeight+boxSpacing)+boxFontSizeLarge/*+(boxHeight/2)*/);
				//find if any players got that init
				var playersOnThisInit = initTable.filter(function (obj)
				{
					return parseInt(obj.number) === parseInt(number)
				});
				//if find players, print names
				var playerRow = 0;
				playersOnThisInit.forEach(function(player)
				{
					theCanvas.font = "16px Arial";
					theCanvas.fillStyle = "#000000";
					theCanvas.fillText(player.name,((j*(boxWidth+boxSpacing))+(boxSpacing)),i*(boxHeight+boxSpacing)+boxFontSizeLarge+boxFontSizeSmall+(playerRow*boxFontSizeSmall));
					playerRow++; //adds another row if more players
				});
				//Next box number
				number--;
			}
		}
		
		theCanvas.font = "16px Arial";
		theCanvas.fillStyle = "#000000";
		
		//Send it!
		console.log('Sending image to discord..');

		var formData = new FormData();
		
		var canvas = document.getElementById("myCanvas");
		var MyImage = canvas.toDataURL("image/png");
		
		urltoFile(MyImage, 'mypic.png', 'image/png')
		.then(function(file)
		{
			var MyFile = new File([MyImage], "mypic.png", {type: "image/png"})
			
			//formData.append('payload_json', JSON.stringify({"embeds": [{"title": getTimestamp()}]})); 
			formData.append('file', file);	
			
			var poster = new XMLHttpRequest();
			
			poster.open("POST", discordUrl, true);
			poster.onload = function(oEvent) {
			if (poster.status == 200)
			{
				console.log("...done");
			}
			else
			{
				console.log("Error " + poster.status + ": " + oEvent.target.responseText );
			}
			};
			poster.send(formData);
		})
	}
}

function urltoFile(url, filename, mimeType){
    return (fetch(url)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], filename, {type:mimeType});})
    );
}

function changeDiscordLink()
{
	console.log("Discord link was :" + localStorage.discordLink);
	
	if (localStorage.discordLink && localStorage.discordLink != 'null')
	{
		localStorage.discordLink = prompt("Enter Discord Webhook Link", localStorage.discordLink);
	}
	else
	{
		localStorage.discordLink = prompt("Enter Discord Webhook Link", "https://discordapp.com/api/webhooks/570287623592214528/rQDwgXYlXvZlVSDZ8NCB4jtqDBlvfGwrcBtuSX7jFJizLhDfBl0nwlRFnine_1erLDvD");
	}

	console.log("Done. Storage is now:" + localStorage.discordLink);
}

function deleteDiscordLink()
{
	console.log("Discord link was :" + localStorage.discordLink);
	localStorage.removeItem('discordLink');
	console.log("Removed storare. Storage is now:" + localStorage.discordLink);
}

function sendToDiscordText()
{
	if(listIsNotEmpty())
	{
		console.log('Sending text to discord..');
		var discordUrl = getDiscordLink();
		if (discordUrl == undefined || discordUrl == 'null' || discordUrl == "") 
		{
			throw new Error("No Discord Link Entered");
		}
		var message = makeInitlistText();
		var poster = new XMLHttpRequest();
		poster.open("POST", discordUrl, true);
		poster.setRequestHeader("Content-Type", "application/json");
		var data = JSON.stringify({"content": message});
		poster.send(data);
		console.log('...done.');
	}
}

function makeInitlistText()
{
	const listItems = document.querySelectorAll('.nobullets li');
	var message = "[Initiative]\n";
	for (let i = 0; i < listItems.length; i++)
	{
		message += listItems[i].textContent + "\n";
	}
	return message;
}

function makeInitlistImage()
{
	const listItems = document.querySelectorAll('.nobullets li');
	var canvas = document.getElementById("myCanvas");
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	var theCanvas = canvas.getContext("2d");
	theCanvas.font = "16px Arial";
	var x = 10;
	var y = 0;
	theCanvas.fillText("[Initiativ]",x,y+16);
	for (let i = 0; i < listItems.length; i++)
	{
		theCanvas.fillText(listItems[i].textContent,x,(y+((i+2)*16))); 
	}
}

function getDiscordLink()
{
	var discordLink;
	if (localStorage.getItem('discordLink') === null )
	{
		discordLink = prompt("Enter Discord Webhook Link", "https://discordapp.com/api/webhooks/570287623592214528/rQDwgXYlXvZlVSDZ8NCB4jtqDBlvfGwrcBtuSX7jFJizLhDfBl0nwlRFnine_1erLDvD");
		localStorage.setItem('discordLink', discordLink);
	}
	else
	{
		discordLink = localStorage.getItem('discordLink');	
	}
	return discordLink;
}

function allowDrop(ev)
{
	ev.preventDefault();
}

function drag(ev)
{
	ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev)
{
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	if($(ev.target).attr('class')=="initbox" || ev.target.id=="output")
	{
		ev.target.appendChild(document.getElementById(data));  
		ev.target.focus();
	}
}

function recallAllAgents()
{
	if(doYouReally())
	{
		$( ".initbox" ).each(function( index )
		{
		  if($( this ).html() != "")
		  {
			  var initnumber = $(this).attr('title');
			  $( this ).find(".card").each(function( index )
			  {
				document.getElementById("output").appendChild(this);
			  });
		  }
		});
	}
}

function getTimestamp()
{
	var d = new Date(); 
	var timeNow = "" + ('0'+d.getHours()).slice(-2) + "" + ('0'+d.getMinutes()).slice(-2) + "" + ('0'+d.getSeconds()).slice(-2);
	return timeNow;
}

function listIsNotEmpty()
{
	if($("#initlist li").length > 0)
	{
		return true;
	}
	else
	{
		console.log("List is empty! Nothing to make.");
		return false;
	}
}

function doYouReally()
{
	if(window.confirm("Vill du verkligen återkalla alla agenter till agentpoolen?"))
	{
		return 1;
	}
	else
	{
		return 0;
	}
}

function changeIMG(ev)
{
	var newurl = window.prompt("Image",ev.target.firstChild.src);
	if(newurl)
	{
		ev.target.firstChild.src = newurl;
	}
}