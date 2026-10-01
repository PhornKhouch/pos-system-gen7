export const createUserSlice = (set) => ({
  selectedUserId: null,
  userFilters: {
    search: '',
    department: 'All',
  },
  setSelectedUser: (id) => set({ selectedUserId: id }),
  setUserFilters: (filters) => set((state) => ({ userFilters: { ...state.userFilters, ...filters } })),
});
