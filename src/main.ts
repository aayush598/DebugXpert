import { openAndCompareFile } from './utils/compareFile';
import { evaluateCode } from './utils/evaluateCode';
import { analyzeCode }  from './utils/Vulnerability';
import { errorfix }  from './utils/Errorfix';

export function activateMain() {
    // openAndCompareFile();
    // evaluateCode();
    // analyzeCode();
    errorfix()

}
