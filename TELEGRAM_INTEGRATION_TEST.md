# Testing the Telegram Integration

To test the new Telegram integration with the Autopilot agent, follow these steps:

1.  **Set the `TELEGRAM_BOT_TOKEN` environment variable.**
    - Create a `.env` file in the root of the project if it doesn't already exist.
    - Add the following line to the `.env` file, replacing `<your_bot_token>` with your actual Telegram bot token:
      ```
      TELEGRAM_BOT_TOKEN=<your_bot_token>
      ```

2.  **Run the server.**
    - Open a terminal and run `npm install` to make sure all dependencies are installed.
    - Run `npm start` to start the server.

3.  **Interact with the Telegram bot:**
    - Open Telegram and find your bot.
    - Send the following commands and verify the responses:
        - `/start`: The bot should respond with a welcome message.
        - `/autopilot_status`: The bot should respond with the current status of the Autopilot agent.
        - `/autopilot_stop`: The bot should respond that the Autopilot agent has been stopped.
        - `/autopilot_start`: The bot should respond that the Autopilot agent has been started.
        - `/autopilot_task Analyze the latest performance metrics`: The bot should respond that a task has been created and assigned. You should also see a message from the agent confirming the task creation.
