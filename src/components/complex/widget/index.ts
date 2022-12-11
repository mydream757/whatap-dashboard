import InternalWidget from './Widget';
import WidgetHeader from './WidgetHeader';
import WidgetBody from './WidgetBody';

type MainComponent = typeof InternalWidget;

interface WidgetComponent extends MainComponent {
  Header: typeof WidgetHeader;
  Body: typeof WidgetBody;
}

const Widget: WidgetComponent = Object.assign(InternalWidget, {
  Header: WidgetHeader,
  Body: WidgetBody,
});

export default Widget;
