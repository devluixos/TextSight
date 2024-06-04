![TextSight gif](https://github.com/devluixos/TextSight/blob/master/showcase_gif.gif)

## TextSight
TextSight is an Obsidian plugin that utilizes OpenAI's powerful language models analyse your selected notes and create connection based on topics, keywords and named entities. It uses Dexie.js as a wrapper for IndexedDB to manage structured data like documents, analysis results, and more, enabling efficient data retrieval and storage within the plugin.

#### Goals
The primary goal of TextSight is to visualise connection in your notes, enabling the user to explore their thoughts visually and finds insights or hidden connections. The experience should also be filterable and customisable to your liking in the future.

#### Installation
Follow these steps to install TextSight:

1. Clone the Plugin: Navigate to your Obsidian vault's plugins folder. This is typically located in your vault's root directory under `.obsidian/plugins/.` Clone the TextSight repository into this directory using the following command:
```bash
git clone https://github.com/devluixos/TextSight.git
```
2. Install Dependencies: Navigate into the TextSight directory and run the following command to install the necessary dependencies:
```bash
npm install
```
3. API Key Setup: Run the setup script using the following command:
```bash
npm run setup
```
When prompted, enter your OpenAI API key. This key is stored securely and is used to make API calls to OpenAI.

4. Enable in Obsidian: Open Obsidian, go to `Settings -> Community Plugins`, disable `Safe Mode`, and enable `TextSight` from the list.
