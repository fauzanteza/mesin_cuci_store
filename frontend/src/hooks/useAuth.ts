import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout as logoutAction } from '../store/slices/authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

    const logout = () => {
        dispatch(logoutAction());
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        logout,
    };
};
