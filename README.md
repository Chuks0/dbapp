# Firebase Hosting

This project uses Firebase Hosting for development. If you don't already have `firebase CLI` installed
you can run the following command to install the latest version:

```sh
npm install -g firebase-tools
```

For other CLI management options, visit the [CLI documentation](https://firebase.google.com/docs/cli#update-cli).

## Development

- To get to the React app go to the [`./hosting`](./hosting/) directory:

- From [`./hosting`](./hosting/) use the following command to run the app in _development moded_:

```sh
npm run dev
```

## Deployment

- To deploy to your site, run the following command from the root of your local project directory:

```sh
firebase deploy --only hosting
```

- Application will be deployed to the following url:
  > [_PROJECT_ID_.web.app](https://quickaskserver.web.app/).
  > [_PROJECT_ID_.firebaseapp.com](https://quickaskserver.firebaseapp.com/).

## TODO:

- [x] #739
- [ ] https://github.com/octo-org/octo-repo/issues/740
- [ ] Add delight to the experience when all tasks are complete :tada:
- [ ] \(Optional) Open a followup issue

## Alerts:

> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.
