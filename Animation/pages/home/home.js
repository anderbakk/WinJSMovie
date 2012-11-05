(function () {
    
    "use strict";

    var ratingSpan;
    var selectedtitle;
    var ratingContainer;
    var ratingControl;
    var citiesListView;
    var selectedtitle;
    var selectedImage;
    var selectedItem;
    var description;
    var notifications = Windows.UI.Notifications;

    var movies = [
        { title: 'The Godfather', rating:5, image: 'images/godfather.jpg', info: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.' },
        { title: 'Matrix', rating:5,image: 'images/matrix.jpg', info: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.' },
        { title: 'Star Wars', rating:5, image: 'images/starwars.jpg', info:"Luke Skywalker, a spirited farm boy, joins rebel forces to save Princess Leia from the evil Darth Vader, and the galaxy from the Empire's planet-destroying Death Star." },
        { title: 'The Lord Of The Rings', rating:5, image: 'images/lordoftherings.jpg', info: 'An innocent hobbit of The Shire journeys with eight companions to the fires of Mount Doom to destroy the One Ring and the dark lord Sauron forever.' },
        { title: 'The Terminator', rating:4, image: 'images/terminator.jpg', info: 'A cyborg is sent back in time, by the sinister computer network Skynet, to murder a woman who will one day give birth to the leader of the militia destined to end the coming robo-apocalypse.' },
        { title: 'Scarface', rating:5, image: 'images/scarface.jpg', info: 'In 1980 Miami, a determined Cuban immigrant takes over a drug cartel while succumbing to greed.' }
    ];

    var list = new WinJS.Binding.List(movies).createSorted(function(first, second) {
        if (first.title.charAt(0) > second.title.charAt(0))
            return 1;
        else
            return -1;
    });


    WinJS.UI.Pages.define("/pages/home/home.html", {
        ready: function (element, options) {
            ratingSpan = document.getElementById('RatingSpan');
            ratingContainer = document.getElementById('RatingContainer');
            selectedImage = document.getElementById('RatingImage');
            description = document.getElementById('Description');
            ratingControl = document.getElementById('RatingControl').winControl;
            ratingControl.addEventListener('change', change);
            var btn = document.getElementById('SubmitButton');
            btn.addEventListener('click', submit);

            citiesListView = document.getElementById('MoviesListView').winControl;
            citiesListView.itemDataSource = list.dataSource; 
            citiesListView.addEventListener('iteminvoked', itemInvoked);

            document.getElementById('Fullscreen').addEventListener('click', viewFullscreen);
            document.getElementById('refresh').winControl.addEventListener('click', addMovie);

            updateLiveTiles();
        }
    });

    function itemInvoked(e) {
        e.detail.itemPromise.then(function (item) {
                WinJS.UI.Animation.fadeOut(ratingContainer).then(function () {
                selectedItem = item.data;
                ratingContainer.style.visibility = 'visible';
                selectedtitle = selectedItem.title;
                ratingControl.userRating = selectedItem.rating;
                ratingSpan.innerHTML = selectedItem.title;
                description.innerHTML = selectedItem.info;
                selectedImage.src = selectedItem.image;
                WinJS.UI.Animation.fadeIn(ratingContainer);
            });
        });

    }
    
    function viewFullscreen() {
        WinJS.Navigation.navigate("/pages/fullpage/fullpage.html", { item : selectedItem });
    }
    
    function addMovie() {
        showBadge();
        list.push({ title: 'Aliens', image: 'images/aliens.jpg', info: 'The planet from Alien has been colonized, but contact is lost. This time, the rescue team has impressive firepower, but will it be enough?' });
    }

    function submit() {
        var msg = new Windows.UI.Popups.MessageDialog('You gave ' + selectedItem.title + ' ' + selectedItem.rating + ' stars');
        msg.commands.append(new Windows.UI.Popups.UICommand('Continue', function (cmd) {
            clear();
        }));
        msg.showAsync();
    }

    function change() {
        notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(true);
            selectedItem.rating = ratingControl.userRating;
    }

    function clear() {
        ratingSpan.innerHTML = '';
        ratingContainer.style.visibility = 'hidden';
        ratingControl.userRating = 0;
    }
    
    function updateLiveTiles() {
        notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(true);
        list.forEach(function(item) {
            updateLiveTile(item);
        });
    }
    
    function updateLiveTile(movie) {
        

        var template = notifications.TileTemplateType.tileWideSmallImageAndText04;
        var wideTemplate = notifications.TileUpdateManager.getTemplateContent(template);
        var title = wideTemplate.selectSingleNode('//text[@id=1]');
        var rating = wideTemplate.selectSingleNode('//text[@id=2]');
        var image = wideTemplate.selectSingleNode('//image');
        title.appendChild(wideTemplate.createTextNode(movie.title));
        rating.appendChild(wideTemplate.createTextNode('Rating: ' + movie.rating));
        image.setAttribute('src', 'ms-appx:///' + movie.image);
        
        var squareTemplate = notifications.TileTemplateType.tileSquarePeekImageAndText04;
        var squareTileXml = notifications.TileUpdateManager.getTemplateContent(squareTemplate);
        var squareTileImage = squareTileXml.selectSingleNode('//image');
        var squareTileTextAttributes = squareTileXml.selectSingleNode('//text');
        squareTileTextAttributes.appendChild(squareTileXml.createTextNode(movie.title));
        squareTileImage.setAttribute('src', movie.image);

        var node = wideTemplate.importNode(squareTileXml.getElementsByTagName('binding').item(0), true);
        wideTemplate.getElementsByTagName('visual').item(0).appendChild(node);

        var tileNotification = new notifications.TileNotification(wideTemplate);
        notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
    };
    
    function showBadge() {
        var badgeType = notifications.BadgeTemplateType.badgeNumber;
        var badgeXml = notifications.BadgeUpdateManager.getTemplateContent(badgeType);

        var badge = badgeXml.selectSingleNode("//badge");
        badge.setAttribute("value", 1);

        var badgeNotification = new notifications.BadgeNotification(badgeXml);
        notifications.BadgeUpdateManager.createBadgeUpdaterForApplication().update(badgeNotification);
    }
})();
