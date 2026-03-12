src/              
│
├── core/                       # Phần dùng chung toàn app, không thuộc business module cụ thể
│   ├── api/                    # API client, fetcher, interceptor, xử lý request/response chung
│   ├── auth/                   # Session, token, permission, auth helper dùng toàn app
│   ├── config/                 # Cấu hình hệ thống, app config, env mapping
│   ├── constants/              # Hằng số dùng chung: route keys, storage keys, enum tĩnh...
│   ├── hooks/                  # Custom hooks generic dùng toàn app
│   ├── utils/                  # Utility functions, helper functions thuần
│   ├── components/             # Component dùng chung toàn ứng dụng
│   │   ├── ui/                 # Component UI base như Button, Input, Modal...
│   │   ├── layout/             # Component layout chung như Header, Sidebar...
│   │   └── feedback/           # Component phản hồi UI như Loader, EmptyState, ErrorBox...
│   └── types/                  # Type/interface dùng chung toàn app
│
└── modules/                    # Các module nghiệp vụ, tổ chức theo domain/business
    ├── auth/                   # Module xác thực
    │   ├── api/                # API của module auth
    │   ├── dto/                # DTO request/response của auth
    │   ├── types/              # Type nội bộ của auth
    │   ├── hooks/              # Hook nghiệp vụ của auth
    │   ├── utils/              # Helper, mapper, xử lý riêng của auth
    │   ├── components/         # Component dùng trong nhiều page của auth
    │   └── pages/              # Các page thuộc module auth
    │       ├── LoginPage/      # Thư mục riêng của page login
    │       │   ├── components/ # Component chỉ phục vụ LoginPage
    │       │   ├── LoginPage.tsx
    │       │   └── index.ts
    │       └── ForgotPasswordPage/ # Thư mục riêng của page quên mật khẩu
    │
    ├── user/                   # Module user
    │   ├── api/                # API của module user
    │   ├── dto/                # DTO request/response của user
    │   ├── types/              # Type nội bộ của user
    │   ├── hooks/              # Hook nghiệp vụ của user
    │   ├── utils/              # Helper, mapper, xử lý riêng của user
    │   ├── components/         # Component dùng trong nhiều page của user
    │   │   ├── UserForm/       # Form dùng lại trong module user
    │   │   └── UserTable/      # Table dùng lại trong module user
    │   └── pages/              # Các page thuộc module user
    │       ├── UserListPage/   # Page danh sách user
    │       │   ├── components/ # Component chỉ phục vụ UserListPage
    │       │   ├── hooks/      # Hook chỉ phục vụ UserListPage
    │       │   ├── UserListPage.tsx
    │       │   └── index.ts
    │       ├── UserDetailPage/ # Page chi tiết user
    │       └── UserCreatePage/ # Page tạo mới user
    │
    ├── product/                # Module product
    └── dashboard/              # Module dashboard