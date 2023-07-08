import { getCaiyunTranslate, getYoudaoFreeTranslate } from '../../../api/translateApi';

abstract class Translator<T> {
    public translatorConfig: T;

    public constructor(translatorConfig: T) {
        this.translatorConfig = translatorConfig;
    }

    public abstract translate(context: string): Promise<string>;
}

// TODO: replace other free translate api, youdao is not allow CORS
class YoudaoFreeTranslator extends Translator<{}> {
    public constructor() {
        super({});
    }

    public translate(context: string): Promise<string> {
        return new Promise((resolve) => {
            getYoudaoFreeTranslate(context).then((data) => {
                let tgt = '';
                try {
                    tgt = data.translateResult[0][0].tgt;
                } catch (e) {
                    console.log('translate err', e, data);
                    tgt = '';
                }
                resolve(tgt);
            });
        });
    }
}

interface CaiyunConfig {
    token: string;
}

class CaiyunTranslator extends Translator<CaiyunConfig> {
    public translate(context: string): Promise<string> {
        return new Promise((resolve) => {
            getCaiyunTranslate(context, this.translatorConfig.token).then((data) => {
                let tgt = '';
                try {
                    tgt = data.target[0];
                } catch (e) {
                    console.log('translate err', e, data);
                    tgt = '';
                }
                resolve(tgt);
            });
        });
    }
}

export { Translator, YoudaoFreeTranslator, CaiyunTranslator };
