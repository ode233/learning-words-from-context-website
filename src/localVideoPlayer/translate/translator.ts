import { getCaiyunTranslate, getYoudaoFreeTranslate } from '../../api/translateApi';

abstract class Translator<T> {
    public translatorConfig: T;

    public constructor(translatorConfig: T) {
        this.translatorConfig = translatorConfig;
    }

    public abstract translate(context: string): string;
}

class YoudaoFreeTranslator extends Translator<{}> {
    public constructor() {
        super({});
    }

    public translate(context: string): string {
        let tgt = '';
        getYoudaoFreeTranslate(context).then((data) => {
            try {
                tgt = data.translateResult[0][0].tgt;
            } catch (e) {
                console.log('translate err', e, data);
            }
        });
        return tgt;
    }
}

interface CaiyunConfig {
    token: string;
}

class CaiyunTranslator extends Translator<CaiyunConfig> {
    public translate(context: string): string {
        let tgt = '';
        getCaiyunTranslate(context, this.translatorConfig.token).then((data) => {
            try {
                tgt = data.target[0];
            } catch (e) {
                console.log('translate err', e, data);
            }
        });
        return tgt;
    }
}

export { Translator, YoudaoFreeTranslator, CaiyunTranslator };
