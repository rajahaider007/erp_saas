# Permission System Usage Examples

This document provides examples of how to use the permission system in your React components.

## 1. Using the usePermissions Hook

```jsx
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { canView, canAdd, canEdit, canDelete, hasRole, isAdmin } = usePermissions();

  return (
    <div>
      {canView('/system/users') && (
        <div>User management content</div>
      )}
      
      {canAdd('/system/users') && (
        <button>Add User</button>
      )}
      
      {isAdmin() && (
        <div>Admin only content</div>
      )}
    </div>
  );
};
```

## 2. Using PermissionAwareForm

```jsx
import PermissionAwareForm from '../Components/PermissionAwareForm';

const CreateUserForm = () => {
  return (
    <PermissionAwareForm
      requiredPermission="can_add"
      route="/system/users"
      fallbackMessage="You don't have permission to create users."
    >
      <YourFormComponent />
    </PermissionAwareForm>
  );
};
```

## 3. Using PermissionButton

```jsx
import { PermissionButton } from '../Components/PermissionAwareForm';

const UserActions = () => {
  return (
    <div>
      <PermissionButton
        requiredPermission="can_add"
        route="/system/users"
        onClick={() => console.log('Add user')}
        className="btn btn-primary"
      >
        Add User
      </PermissionButton>
      
      <PermissionButton
        requiredPermission="can_edit"
        route="/system/users"
        onClick={() => console.log('Edit user')}
        className="btn btn-secondary"
      >
        Edit User
      </PermissionButton>
      
      <PermissionButton
        requiredPermission="can_delete"
        route="/system/users"
        onClick={() => console.log('Delete user')}
        className="btn btn-danger"
      >
        Delete User
      </PermissionButton>
    </div>
  );
};
```

## 4. Using PermissionLink

```jsx
import { PermissionLink } from '../Components/PermissionAwareForm';

const Navigation = () => {
  return (
    <nav>
      <PermissionLink
        href="/system/users"
        requiredPermission="can_view"
        route="/system/users"
        className="nav-link"
      >
        Users
      </PermissionLink>
      
      <PermissionLink
        href="/system/companies"
        requiredPermission="can_view"
        route="/system/companies"
        className="nav-link"
      >
        Companies
      </PermissionLink>
    </nav>
  );
};
```

## 5. Backend Route Protection

```php
// In routes/web.php
Route::prefix('system/users')->name('system.users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])
        ->middleware('permission:can_view,/system/users')
        ->name('index');
    
    Route::get('/create', [UserController::class, 'create'])
        ->middleware('permission:can_add,/system/users')
        ->name('create');
    
    Route::post('/', [UserController::class, 'store'])
        ->middleware('permission:can_add,/system/users')
        ->name('store');
    
    Route::get('/{user}/edit', [UserController::class, 'edit'])
        ->middleware('permission:can_edit,/system/users')
        ->name('edit');
    
    Route::put('/{user}', [UserController::class, 'update'])
        ->middleware('permission:can_edit,/system/users')
        ->name('update');
    
    Route::delete('/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:can_delete,/system/users')
        ->name('destroy');
});
```

## 6. Menu Filtering in Sidebar/Header

The sidebar and header components automatically filter menus based on user permissions. No additional code is needed - the `usePermissions` hook is already integrated.

## 7. Permission Checking in Controllers

```php
// In your controller
use App\Services\PermissionService;

class UserController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        if (!PermissionService::userHasAccess($user, '/system/users', 'can_view')) {
            return redirect()->back()->with('error', 'Access denied');
        }
        
        // Your controller logic here
    }
}
```

## 8. Custom Permission Checks

```jsx
const MyComponent = () => {
  const { 
    hasPermission, 
    getMenuPermissions, 
    showPermissionDeniedAlert 
  } = usePermissions();

  const handleAction = (action) => {
    if (!hasPermission('/system/users', 'can_add')) {
      showPermissionDeniedAlert('add', 'users');
      return;
    }
    
    // Perform action
  };

  const permissions = getMenuPermissions('/system/users');
  console.log(permissions); // { can_view: true, can_add: false, can_edit: true, can_delete: false }

  return (
    <div>
      {permissions.can_add && (
        <button onClick={() => handleAction('add')}>Add User</button>
      )}
    </div>
  );
};
```

## Available Permission Types

- `can_view` - View/read access
- `can_add` - Create/add access  
- `can_edit` - Update/edit access
- `can_delete` - Delete access

## Available Role Checks

- `hasRole(role)` - Check specific role
- `hasAnyRole(roles)` - Check any of multiple roles
- `isAdmin()` - Check if user is admin or super admin
- `isSuperAdmin()` - Check if user is super admin

## Best Practices

1. Always wrap forms with `PermissionAwareForm` for create/edit operations
2. Use `PermissionButton` for action buttons that require specific permissions
3. Use `PermissionLink` for navigation links
4. Apply permission middleware to all protected routes
5. Use the `usePermissions` hook for conditional rendering
6. Show appropriate fallback messages when permissions are denied
7. Test with different user roles to ensure proper permission enforcement
