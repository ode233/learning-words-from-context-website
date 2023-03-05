import { CaiyunTranslator, Translator, YoudaoFreeTranslator } from '../definition/translatorDefinition';
import { getUserConfig } from '../definition/userConfigDefinition';

// init userconfig
let translator: Translator<any>;
let userConfig = getUserConfig();
if (userConfig.caiyunToken) {
    translator = new CaiyunTranslator({ token: userConfig.caiyunToken });
} else {
    translator = new YoudaoFreeTranslator();
}

export { translator };
