function notify(message) {
  console.log('notifying', message);
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(message);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {

  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}

function notificationPermission(){
  Notification.requestPermission().then(function (permission) {
    // If the user accepts, let's create a notification
    console.log('permission granted')
  });
}

export {notify, notificationPermission};