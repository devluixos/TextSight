## TextSight
### Installation

    Clone the Plugin: Clone or download the plugin to your Obsidian vault's plugins folder.
    Enable in Obsidian: Open Obsidian, go to Settings -> Community Plugins, disable Safe Mode, and enable the plugin from the list.

## Configuration
### API Key Setup

    Run npm install within the plugin directory to install dependencies.
    Execute npm run setup to initiate the setup script.
    When prompted, enter your OpenAI API key. This key is stored securely and used to make API calls.

### Database

The plugin utilizes Dexie.js as a wrapper for IndexedDB, managing structured data like documents, analysis results, and more, enabling efficient data retrieval and storage within the plugin.
Making API Calls

API calls to OpenAI are made using the stored API key. These calls are used to fetch data or perform actions based on user interactions within Obsidian. The responses are processed and stored in the IndexedDB for quick access and manipulation.
