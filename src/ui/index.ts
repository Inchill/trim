import Nav from './nav';
import Toolbar from './toolbar';
import Canvas from './canvas';
import AreaSelect from './area-select';
import Loading from './loading';

export const createTrimImageEditorUI = () => `
    <div class="trim-root-wrapper">
        ${Nav()}
        ${AreaSelect()}
        ${Toolbar()}
        ${Canvas()}
        ${Loading()}
    </div>
`;
