import { CaiyunTranslator, YoudaoFreeTranslator } from '../components/localVideoPlayer/translate/translator';
import {
    requestPermission,
    getDeckNames,
    createDeck,
    getModelNames,
    createModel,
    ANKI_DECK_NAME,
    ANKI_MODEL_NAME
} from '../api/ankiApi';
class UserConfig {
    public caiyunToken = '';
}

/**
 * get user config
 * @returns {UserConfig}
 */
function getUserConfig() {
    const config = localStorage.getItem('userConfig');
    if (config) {
        return JSON.parse(config) as UserConfig;
    }
    return new UserConfig();
}

/**
 * set user config
 * @param {UserConfig} config
 * @returns {void}
 */
function setUserConfig(config: UserConfig) {
    localStorage.setItem('userConfig', JSON.stringify(config));
}

async function initAnkiConfig() {
    let res = (await requestPermission()).result;
    console.log('requestPermission', res);
    if (!res || res['permission'] !== 'granted') {
        window.alert('Need anki permission');
        return;
    }

    let deckNames: [string] = (await getDeckNames()).result;
    if (!deckNames.includes(ANKI_DECK_NAME)) {
        await createDeck();
    }
    let modelNames: [string] = (await getModelNames()).result;
    if (!modelNames.includes(ANKI_MODEL_NAME)) {
        await createModel();
    }
}

function initUserConfig() {
    // init user config
    let userConfig = getUserConfig();
    // TODO: config page
    userConfig.caiyunToken = '7yboofgmqoa5cbp2flgn';
    if (userConfig.caiyunToken) {
        translator = new CaiyunTranslator({ token: userConfig.caiyunToken });
    } else {
        translator = new YoudaoFreeTranslator();
    }
}

function init() {
    initAnkiConfig();
    initUserConfig();
}

let translator = new YoudaoFreeTranslator();

export { init, translator };
