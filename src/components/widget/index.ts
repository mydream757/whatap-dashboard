import InternalWidget from './Widget';
import Header from './Header';
import Body from './Body';

type MainComponent = typeof InternalWidget;

interface WidgetComponent extends MainComponent {
  Header: typeof Header;
  Body: typeof Body;
}

const Widget: WidgetComponent = Object.assign(InternalWidget, {
  Header,
  Body,
});

export default Widget;
