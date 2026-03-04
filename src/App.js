import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
// const cors = require('cors');
// app.use(cors());

const API_URL = 'https://backend-3t9u.onrender.com';

// --- 1. صفحة تسجيل الدخول وإنشاء الحساب ---
function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const isFormValid = formData.username.trim() !== '' && formData.password.trim() !== '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // دالة موحدة للتعامل مع الدخول والتسجيل
  const sendRequest = async (endpoint, loadingMessage, isLogin = true) => {
    setStatus(loadingMessage);
    setIsError(false);
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      setStatus(res.data.message);
      setIsError(false);
      if (isLogin) {
        setTimeout(() => navigate('/phonebook'), 1000);
      }
    } catch (err) {
      setStatus(err.response?.data?.message || 'حدث خطأ ما');
      setIsError(true);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>نظام إدارة المستخدمين</h2>
      <form style={formStyle}>
        <input type="text" name="username" placeholder="اسم المستخدم" onChange={handleChange} style={inputStyle} />
        <input type="password" name="password" placeholder="كلمة المرور" onChange={handleChange} style={inputStyle} />
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            type="button" 
            disabled={!isFormValid} 
            onClick={() => sendRequest('/login', 'جاري التحقق...')}
            style={{...buttonStyle, flex: 1, backgroundColor: isFormValid ? '#646cff' : '#ccc'}}
          >
            دخول
          </button>
          <button 
            type="button" 
            disabled={!isFormValid} 
            onClick={() => sendRequest('/register', 'جاري إنشاء الحساب...', false)}
            style={{...buttonStyle, flex: 1, backgroundColor: isFormValid ? '#2ecc71' : '#ccc'}}
          >
            إنشاء حساب
          </button>
        </div>
      </form>
      {status && <p style={{ color: isError ? 'red' : 'green', fontWeight: 'bold' }}>{status}</p>}
    </div>
  );
}

// --- 2. صفحة دليل الهاتف (مع الجدول) ---
function PhoneBook() {
  const [contact, setContact] = useState({ name: '', phone: '' });
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');

  // جلب البيانات عند تحميل الصفحة لأول مرة
  const fetchData = async () => {
    setMsg('جاري تحميل البيانات...'); // رسالة للمستخدم أثناء انتظار استيقاظ السيرفر
    try {
      // نضع timeout لأن سيرفرات Render المجانية تأخذ وقتاً للاستيقاظ
      const res = await axios.get(`${API_URL}/contacts`, { timeout: 10000 });
      setList(res.data);
      setMsg(''); // مسح رسالة الخطأ عند النجاح
    } catch (err) {
      console.error("Fetch Error:", err);
      
      if (err.code === 'ECONNABORTED') {
        setMsg('السيرفر يستغرق وقتاً للاستيقاظ، يرجى تحديث الصفحة بعد لحظات');
      } else {
        setMsg('خطأ في جلب البيانات: تأكد من رابط الـ API');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/contacts`, contact);
      setMsg('تم الحفظ بنجاح');
      setContact({ name: '', phone: '' }); // تفريغ الحقول
      fetchData(); // تحديث الجدول فوراً
    } catch (err) { setMsg('فشل الحفظ'); }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/contacts`, contact);
      setMsg('تم التعديل بنجاح');
      fetchData(); 
    } catch (err) { setMsg('فشل التعديل'); }
  };

  const handleDelete = async (nameToDelete) => {
    try {
      const target = nameToDelete || contact.name;
      await axios.delete(`${API_URL}/contacts/${target}`);
      setMsg('تم الحذف');
      setContact({name: '', phone: ''});
      fetchData();
    } catch (err) { setMsg('فشل الحذف'); }
  };

  // اختيار جهة اتصال من الجدول لتعديلها أو حذفها
  const selectContact = (item) => {
    setContact(item);
  };

  return (
    <div style={containerStyle}>
      <h2>📖 دليل الهاتف الذكي</h2>
      
      <div style={formStyle}>
        <input type="text" placeholder="الاسم" style={inputStyle} value={contact.name} onChange={(e)=>setContact({...contact, name: e.target.value})} />
        <input type="text" placeholder="رقم الجوال" style={inputStyle} value={contact.phone} onChange={(e)=>setContact({...contact, phone: e.target.value})} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button onClick={handleSave} style={{...buttonStyle, backgroundColor: '#27ae60'}}>حفظ جديد</button>
          <button onClick={handleUpdate} style={{...buttonStyle, backgroundColor: '#f39c12'}}>تعديل المختار</button>
          <button onClick={() => handleDelete()} style={{...buttonStyle, backgroundColor: '#e74c3c'}}>حذف المختار</button>
          <button onClick={fetchData} style={{...buttonStyle, backgroundColor: '#3498db'}}>تحديث القائمة</button>
        </div>
      </div>

      {msg && <p style={{ color: '#2c3e50', fontSize: '14px' }}>{msg}</p>}

      {/* جدول عرض البيانات */}
      <div style={{ width: '90%', maxWidth: '500px', marginTop: '20px' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={thTdStyle}>الاسم</th>
              <th style={thTdStyle}>رقم الهاتف</th>
              <th style={thTdStyle}>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, index) => (
              <tr key={index} onClick={() => selectContact(item)} style={{ cursor: 'pointer' }}>
                <td style={thTdStyle}>{item.name}</td>
                <td style={thTdStyle}>{item.phone}</td>
                <td style={thTdStyle}>
                   <button onClick={(e) => { e.stopPropagation(); handleDelete(item.name); }} style={miniButtonStyle}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 3. المكون الرئيسي ---
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/phonebook" element={<PhoneBook />} />
      </Routes>
    </Router>
  );
}

// --- التنسيقات (Styles) ---
const containerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', direction: 'rtl' };
const formStyle = { display: 'flex', flexDirection: 'column', width: '320px' };
const inputStyle = { padding: '12px', margin: '8px 0', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'right', fontSize: '16px' };
const buttonStyle = { padding: '12px', color: 'white', border: 'none', borderRadius: '5px', fontSize: '14px', cursor: 'pointer', transition: '0.3s' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const thTdStyle = { border: '1px solid #ddd', padding: '12px', textAlign: 'center' };
const miniButtonStyle = { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' };
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// const API_URL = 'https://backend-wsx0.onrender.com';

// // --- صفحة تسجيل الدخول ---
// function Login() {
//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [status, setStatus] = useState('');
//   const [isError, setIsError] = useState(false);
//   const navigate = useNavigate();

//   // التحقق من امتلاء الحقول لتفعيل الزر
//   const isFormValid = formData.username.trim() !== '' && formData.password.trim() !== '';

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setStatus('جاري التحقق...');
//     try {
//       const res = await axios.post(`${API_URL}/login`, formData);
//       setStatus(res.data.message);
//       setIsError(false);
//       setTimeout(() => navigate('/phonebook'), 1000);
//     } catch (err) {
//       setStatus(err.response?.data?.message || 'فشل الدخول');
//       setIsError(true);
//     }
//   };

//   return (
//     <div style={containerStyle}>
//       <h2>نظام الدخول</h2>
//       <form onSubmit={handleLogin} style={formStyle}>
//         <input type="text" name="username" placeholder="اسم المستخدم" onChange={handleChange} style={inputStyle} />
//         <input type="password" name="password" placeholder="كلمة المرور" onChange={handleChange} style={inputStyle} />
//         <button 
//           type="submit" 
//           disabled={!isFormValid} 
//           style={{...buttonStyle, backgroundColor: isFormValid ? '#646cff' : '#ccc', cursor: isFormValid ? 'pointer' : 'not-allowed'}}
//         >
//           دخول
//         </button>
//       </form>
//       {status && <p style={{ color: isError ? 'red' : 'green' }}>{status}</p>}
//     </div>
//   );
// }

// // --- صفحة دليل الهاتف ---
// function PhoneBook() {
//   const [contact, setContact] = useState({ name: '', phone: '' });
//   const [list, setList] = useState([]);
//   const [msg, setMsg] = useState('');

//   // 1. جلب البيانات (عرض الكل)
//   const fetchData = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/contacts`);
//       setList(res.data);
//     } catch (err) { setMsg('خطأ في جلب البيانات'); }
//   };

//   // 2. حفظ
//   const handleSave = async () => {
//     try {
//       await axios.post(`${API_URL}/contacts`, contact);
//       setMsg('تم الحفظ');
//       fetchData();
//     } catch (err) { setMsg('فشل الحفظ'); }
//   };

//   // 3. تعديل
//   const handleUpdate = async () => {
//     try {
//       await axios.put(`${API_URL}/contacts`, contact);
//       setMsg('تم التعديل');
//       fetchData();
//     } catch (err) { setMsg('فشل التعديل'); }
//   };

//   // 4. حذف
//   const handleDelete = async () => {
//     try {
//       await axios.delete(`${API_URL}/contacts/${contact.name}`);
//       setMsg('تم الحذف');
//       setContact({name: '', phone: ''});
//       fetchData();
//     } catch (err) { setMsg('فشل الحذف'); }
//   };

//   return (
//     <div style={containerStyle}>
//       <h2>📖 دليل الهاتف</h2>
//       <div style={formStyle}>
//         <input type="text" placeholder="الاسم" style={inputStyle} value={contact.name} onChange={(e)=>setContact({...contact, name: e.target.value})} />
//         <input type="text" placeholder="رقم الجوال" style={inputStyle} value={contact.phone} onChange={(e)=>setContact({...contact, phone: e.target.value})} />
        
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
//           <button onClick={handleSave} style={{...buttonStyle, backgroundColor: '#27ae60'}}>حفظ</button>
//           <button onClick={handleUpdate} style={{...buttonStyle, backgroundColor: '#f39c12'}}>تعديل</button>
//           <button onClick={handleDelete} style={{...buttonStyle, backgroundColor: '#e74c3c'}}>حذف</button>
//           <button onClick={fetchData} style={{...buttonStyle, backgroundColor: '#3498db'}}>عرض الكل</button>
//         </div>
//       </div>
//       <p>{msg}</p>
//       <ul>
//         {list.map((item, index) => (
//           <li key={index}>{item.name} - {item.phone}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/phonebook" element={<PhoneBook />} />
//       </Routes>
//     </Router>
//   );
// }

// // التنسيقات ثابتة كما طلبت
// const containerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'Arial' };
// const formStyle = { display: 'flex', flexDirection: 'column', width: '300px' };
// const inputStyle = { padding: '12px', margin: '8px 0', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'right' };
// const buttonStyle = { padding: '12px', color: 'white', border: 'none', borderRadius: '5px', fontSize: '14px' };


////////////////////////////////////////////////////////////////////////////////////////////

// import { useState } from 'react'
// import axios from 'axios'

// function App() {
//   // 1. حالة تخزين البيانات (كما هي)
//   const [formData, setFormData] = useState({
//     username: '',
//     password: ''
//   });
  
//   // 2. حالة تخزين الرسالة واللون (كما هي)
//   const [status, setStatus] = useState('');
//   const [isError, setIsError] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   // دالة تسجيل الدخول الأصلية
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     await sendRequest('https://backend-wsx0.onrender.com/login', 'جاري التحقق من الدخول...');
//   };

//   // الدالة الجديدة لإنشاء مستخدم
//   const handleRegister = async (e) => {
//     e.preventDefault();
//     await sendRequest('https://backend-wsx0.onrender.com/register', 'جاري إنشاء الحساب...');
//   };

//   // دالة موحدة لإرسال الطلبات لتقليل تكرار الكود
//   const sendRequest = async (url, loadingMessage) => {
//     setStatus(loadingMessage);
//     setIsError(false);

//     try {
//       const response = await axios.post(url, formData);
//       setStatus(response.data.message);
//       setIsError(false);
//     } catch (error) {
//       if (error.response) {
//         setStatus(error.response.data.message || 'حدث خطأ ما');
//       } else {
//         setStatus('فشل الاتصال بالسيرفر');
//       }
//       setIsError(true);
//     }
//   };

//   return (
//     <div style={containerStyle}>
//       <h2>نظام إدارة المستخدمين</h2>
//       <form style={formStyle}>
//         <input
//           type="text"
//           name="username"
//           placeholder="اسم المستخدم"
//           onChange={handleChange}
//           style={inputStyle}
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="كلمة المرور"
//           onChange={handleChange}
//           style={inputStyle}
//           required
//         />
        
//         {/* أزرار التحكم */}
//         <div style={{ display: 'flex', gap: '10px' }}>
//             <button type="button" onClick={handleLogin} style={buttonStyle}>دخول</button>
//             <button type="button" onClick={handleRegister} style={registerButtonStyle}>إنشاء مستخدم جديد</button>
//         </div>
//       </form>

//       {status && (
//         <p style={{ 
//           marginTop: '15px', 
//           color: isError ? 'red' : 'green', 
//           fontWeight: 'bold' 
//         }}>
//           {status}
//         </p>
//       )}
//     </div>
//   );
// }

// // التنسيقات (تمت إضافة تنسيق للزر الجديد)
// const containerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' };
// const formStyle = { display: 'flex', flexDirection: 'column', width: '300px' };
// const inputStyle = { padding: '12px', margin: '8px 0', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'right' };
// const buttonStyle = { flex: 1, padding: '12px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' };
// const registerButtonStyle = { ...buttonStyle, backgroundColor: '#2ecc71' }; // لون أخضر للتمييز

// export default App;


///////////////////////////////////////////////////////////////////////////////////////
// import { useState } from 'react'
// import axios from 'axios'

// function App() {
//   // 1. حالة تخزين البيانات
//   const [formData, setFormData] = useState({
//     username: '',
//     password: ''
//   });
  
//   // 2. حالة تخزين الرسالة التي ستظهر للمستخدم
//   const [status, setStatus] = useState('');
//   // حالة اختيار لون الرسالة (أخضر للنجاح، أحمر للفشل)
//   const [isError, setIsError] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus('جاري التحقق...');
//     setIsError(false);

//     try {
//       // محاولة إرسال البيانات
//       const response = await axios.post('https://backend-wsx0.onrender.com/login', formData);
      
//       // إذا نجح الطلب (Status 200)
//       setStatus(response.data.message);
//       setIsError(false);
//     } catch (error) {
//       // إذا حدث خطأ (مثل 401 Unauthorized)
//       if (error.response) {
//         // هنا نستخرج الرسالة التي أرسلها السيرفر في الاحالة الثانية
//         setStatus(error.response.data.message);
//       } else {
//         // في حال كان السيرفر متوقفاً تماماً
//         setStatus('فشل الاتصال بالسيرفر');
//       }
//       setIsError(true);
//     }
//   };

//   return (
//     <div style={containerStyle}>
//       <h2>تسجيل الدخول</h2>
//       <form onSubmit={handleSubmit} style={formStyle}>
//         <input
//           type="text"
//           name="username"
//           placeholder="اسم المستخدم"
//           onChange={handleChange}
//           style={inputStyle}
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="كلمة المرور"
//           onChange={handleChange}
//           style={inputStyle}
//           required
//         />
//         <button type="submit" style={buttonStyle}>دخول</button>
//       </form>

//       {/* عرض الرسالة بتنسيق ملون بناءً على الحالة */}
//       {status && (
//         <p style={{ 
//           marginTop: '15px', 
//           color: isError ? 'red' : 'green', // أحمر للفشل، أخضر للنجاح
//           fontWeight: 'bold' 
//         }}>
//           {status}
//         </p>
//       )}
//     </div>
//   );
// }

// // التنسيقات
// const containerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' };
// const formStyle = { display: 'flex', flexDirection: 'column', width: '300px' };
// const inputStyle = { padding: '12px', margin: '8px 0', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'right' };
// const buttonStyle = { padding: '12px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' };

// export default App;