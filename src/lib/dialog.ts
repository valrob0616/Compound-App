type ConfirmRequest = {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

type AlertRequest = {
  title: string;
  message?: string;
};

type DialogHostApi = {
  confirm: (request: ConfirmRequest) => void;
  alert: (request: AlertRequest) => void;
};

let host: DialogHostApi | null = null;
const queue: Array<() => void> = [];

export function registerDialogHost(next: DialogHostApi | null): void {
  host = next;
  if (!host) return;
  const pending = queue.splice(0);
  for (const job of pending) job();
}

function enqueue(job: () => void): void {
  if (host) job();
  else queue.push(job);
}

/** In-app notice. Replaces window.alert and Alert.alert. */
export function showMessage(title: string, message?: string): void {
  enqueue(() => host?.alert({ title, message }));
}

export function promptCreateAccount(onCreate: () => void, onCancel?: () => void): void {
  enqueue(() =>
    host?.confirm({
      title: 'Save favorites',
      message: 'Create an account to save this on your account.',
      confirmLabel: 'Create account',
      cancelLabel: 'Not now',
      onConfirm: onCreate,
      onCancel,
    }),
  );
}

export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
): void {
  enqueue(() =>
    host?.confirm({
      title,
      message,
      confirmLabel,
      cancelLabel: 'Cancel',
      onConfirm,
    }),
  );
}
