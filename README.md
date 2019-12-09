# Set up

1. `git clone` this repo or download the ZIP
2. Open the directory in a terminal
3. `yarn install`
4. Build with `yarn build`

# Customize for your use case

1. Make your changes to `index.ts` to reflect your use case (see `Customization 1`, `Customization 2`, etc)
2. Ensure your AWS credentials are set on the CLI (or use `aws-vault exec [your-profile] -- yarn go`)
3. Run with `yarn go` (to test / perform a dry run: comment out the line that contains `DynamoDb.batchWrite`). The progress will be printed to the terminal.
