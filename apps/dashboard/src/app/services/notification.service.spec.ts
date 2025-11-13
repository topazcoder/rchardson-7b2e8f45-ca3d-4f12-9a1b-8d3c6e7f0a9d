import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let svc: NotificationService;
  const mockToastr = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  } as any;

  beforeEach(() => {
    svc = new NotificationService(mockToastr);
  });

  it('success calls toastr.success', () => {
    svc.success('ok', 't');
    expect(mockToastr.success).toHaveBeenCalledWith('ok', 't');
  });

  it('error calls toastr.error', () => {
    svc.error('err');
    expect(mockToastr.error).toHaveBeenCalledWith('err', undefined);
  });

  it('info calls toastr.info', () => {
    svc.info('i');
    expect(mockToastr.info).toHaveBeenCalledWith('i', undefined);
  });

  it('warn calls toastr.warning', () => {
    svc.warn('w');
    expect(mockToastr.warning).toHaveBeenCalledWith('w', undefined);
  });
});
