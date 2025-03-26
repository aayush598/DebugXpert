import { openAndCompareFile } from './utils/compareFile';
import { evaluateCode } from './utils/evaluateCode';
import { analyzeCode }  from './utils/Vulnerability'

export function activateMain() {
    // openAndCompareFile();
    evaluateCode();
    analyzeCode();

}
