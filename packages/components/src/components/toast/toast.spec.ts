import { newSpecPage } from '@stencil/core/testing';
import { Toast } from './toast';

describe('Toast', () => {
  let element;
  beforeEach(async () => {
    element = new Toast();
    jest.useFakeTimers();
    jest.mock('date-fns');
  });
  afterEach(() => {
    jest.clearAllTimers();
  });

  const components = [Toast];

  const timeStamp = 1540035262000;

  it('should match snapshot', async () => {
    const page = await newSpecPage({
      components,
      html: `<t-toast>Toast message</t-toast>`,
    });
    expect(page.root.shadowRoot).toBeTruthy();
    expect(page.root).toMatchSnapshot();
  });

  it('should match snapshot when opened', async () => {
    const page = await newSpecPage({
      components,
      html: `<t-toast opened=true >Label</t-toast>`,
    });
    expect(page.root.shadowRoot).toBeTruthy();
    expect(page.root).toMatchSnapshot();
  });

  it('should match snapshot when autoHide is enabled', async () => {
    const page = await newSpecPage({
      components,
      html: `<t-toast opened=true auto-hide=true>Label</t-toast>`,
    });
    expect(page.root.shadowRoot).toBeTruthy();
    expect(page.root).toMatchSnapshot();
  });

  it('should close the Toast', () => {
    expect(element.opened).toBe(undefined);
    element.onCloseToast();
    jest.runAllTimers();
    expect(element.opened).toBe(false);
  });

  it('should open the Toast', () => {
    expect(element.opened).toBe(undefined);
    element.openToast();
    expect(element.opened).toBe(true);
  });

  it('should hide the toast', () => {
    element.autohide = true;
    element.opened = true;
    element.setToastTimeout();
    jest.runAllTimers();

    setTimeout(() => {
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        element.autohideTime
      );
    }, 10);
  });

  it('should close the toast onCloseToast function', () => {
    element.hideToast = false;
    element.onCloseToast();
    expect(element.hideToast).toBe(true);
  });

  it('should clear the interval onCloseToast function', () => {
    element.timerId = 1;
    element.onCloseToast();
    expect(clearInterval).toHaveBeenCalledWith(expect.any(Number));
  });

  it('should set timeout onCloseToast function', () => {
    element.timerId = 1;
    element.opened = true;
    element.progress = 1;
    element.fadeDuration = 50;
    element.onCloseToast();

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(
      expect.any(Function),
      element.fadeDuration
    );

    jest.runAllTimers();

    expect(element.timerId).toEqual(null);
    expect(element.opened).toEqual(false);
    expect(element.progress).toEqual(0);
  });

  it('should not hide the toast', () => {
    element.autohide = false;
    element.opened = false;
    element.setToastTimeout();
    expect(element.autohide).toBe(false);
  });

  it('should cancel the timeout', () => {
    element.myTimeout = 500;
    element.onCloseToast();

    setTimeout(() => {
      expect(clearTimeout).toHaveBeenCalledTimes(1);
      expect(element.myTimeout).toEqual(undefined);
    }, 10);
  });

  it('should get the autohide time as a number', () => {
    element.autoHide = 500;
    element.getAutoHide();

    setTimeout(() => {
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        element.autoHide
      );
    }, 10);
  });

  it('should get the autohide time as a string', () => {
    element.autoHide = '500';
    element.getAutoHide();

    setTimeout(() => {
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        element.autoHide
      );
    }, 10);
  });

  it('should not get the autohide time because of the boolean', () => {
    element.autoHide = false;
    element.getAutoHide();
    expect(element.root).toBeFalsy();
  });

  it('should not get the autohide time because of value null', () => {
    element.autoHide = null;
    element.getAutoHide();
    expect(element.root).toBeFalsy();
  });

  it('should not get the autohide time because of value undefined', () => {
    element.autoHide = undefined;
    element.getAutoHide();
    expect(element.root).toBeFalsy();
  });

  it('should be defined as a function', () => {
    expect(typeof element.setToastTimeout).toBe('function');
  });

  it('should set interval for timer id in setToastTimeout function', () => {
    element.opened = true;
    element.autoHide = true;
    element.timerId = undefined;
    element.progress = 0;
    element.setToastTimeout();
    jest.runOnlyPendingTimers();
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(element.progress).toBeGreaterThan(1);
  });

  it('should clear the timerId', () => {
    element.timerId = 1;
    element.componentDidUnload();
    expect(element.timerId).toBe(null);
  });

  it('should not componentDidUnload if timerId is null', () => {
    const timer = jest.fn();
    element.componentDidUnload(timer, null);
    expect(timer).not.toHaveBeenCalled();
  });

  it('should have a default css class', () => {
    expect(element.getCssClassMap()).toBe('toast');
  });

  it('should handle custom css class', () => {
    element.customClass = 'custom-class';
    expect(element.getCssClassMap()).toContain('custom-class');
  });

  it('should handle size css class', () => {
    element.size = 'small';
    expect(element.getCssClassMap()).toContain('toast--size-small');
  });

  it('should handle theme css class', () => {
    element.theme = 'default';
    expect(element.getCssClassMap()).toContain('toast--theme-default');
  });

  it('should handle variant css class', () => {
    element.variant = 'primary';
    expect(element.getCssClassMap()).toContain('toast--variant-primary');
  });

  it('should handle hideToast css class', () => {
    element.hideToast = true;
    expect(element.getCssClassMap()).toContain('toast--hide');
  });

  it('should render with default time format', () => {
    element.time = timeStamp;
    element.getTime();

    expect(element.time).toBe(timeStamp);
  });
});
