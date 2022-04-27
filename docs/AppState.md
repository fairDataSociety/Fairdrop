# Docs - Fairdrop App State

Every mailbox has an associated app state to handle useful data about the app state. This data is stored encrypted using the mailbox wallet so it's protected and cannot be accesed by other users.

In the previous version of Fairdrop, the state had the following schema:

```json
{
  "lastLogin": "2022-04-22T07:42:42.675Z",
  "lastReceivedMessage": "2022-04-22T07:42:42.675Z"
}
```

It's quite simple, isn't it? but now let's add more complexity so Fairdrop can change a little its behaviour and offer to the users more features like the possibility to mark as read every file the user received so the control of what has been seen is now on the user side.

So from now on, the new app state will look like:

```json
{
  "lastLogin": "2022-04-22T07:42:42.675Z",
  "markedAsRead": ["message_id_0", ... "message_id_n"]
}
```

Also to give the user more control over the app, the avatar displayed on the app can be customized by now using random apps, but in a near future users could use their own NFTs

```json
{
  "lastLogin": "2022-04-22T07:42:42.675Z",
  "markedAsRead": ["message_id_0", ... "message_id_n"],
  "avatar": {
    "type": "random",
    "address": "https://..."
  }
}
```
