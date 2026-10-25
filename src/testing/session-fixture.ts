// Isolated Jasmine fixture only; never writes browser storage or changes app guards.
export function useEmployeeSessionFixture(): void {
  const user = { id: 'unit-test-user', _id: 'unit-test-user', email: 'employee@example.invalid', firstName: 'Test', lastName: 'Employee' };
  spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => {
    if (key === 'currentUser') return JSON.stringify({ ...user, data: { user } });
    if (key === 'adminView') return 'user';
    if (key === 'roleName') return 'Employee';
    return null;
  });
}
