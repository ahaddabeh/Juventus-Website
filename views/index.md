---
title: FORZA JUVE
description: Just trying stuff out
layout: main
query: getPlayers
---


<header>
<h1 style="text-align:center; color: white; background-color: black;">{{title}}</h1>
</header>
<p style="color: white; text-align: center">{{description}}</p>
<p style="color: white; text-align: center">Welcome to the Juventus Fan page. To view  player information and stats, click the dropdown button and select a player.</p>

{{#each players}}
<div class="row">
  <div class="col-sm-3">
    <a style="display: block; margin-left: auto; margin-right: auto;" href = "/blog/player-info?id={{id}}">
      <img style="height: 300px; width: 300px;" src="/static/assets/images/{{image}}" alt="{{name}}">
    </a>
  </div>
</div>
<br>
{{/each}}


<h3 style="color: white; text-align: center;">Seems like I may have left some players out. Feel free to add a player</h3>
<form action="/new-player" method="POST" enctype="multipart/form-data">
  <div>
    <label for="name" style="color: white;">Player's Name:</label>
    <input style="width: 35%;" type="text" class="form-control" id="name" name="name">
    <br>
    <label for="number" style="color: white">Player's Number:</label>
    <input type="text" style="width: 10%;" class="form-control" id="number" name="number">
    <br>
    <label for="name" style="color: white;">Player's Age:</label>
    <input type="text" style="width: 10%" class="form-control" id="age" name="age">
    <br>
    <label style="color: white;" for="image">Upload a player's a picture</label>
    <br>
    <input type="file" id="image" name="image">

  </div>
  <div> 
    <button type="submit" class="btn btn-primary">Submit</button>
  </div>
  
  </form>

