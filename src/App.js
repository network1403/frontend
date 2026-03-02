import { useState } from 'react'
import axios from 'axios'

function App() {
  // 1. حالة تخزين البيانات
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  // 2. حالة تخزين الرسالة التي ستظهر للمستخدم
  const [status, setStatus] = useState('');
  // حالة اختيار لون الرسالة (أخضر للنجاح، أحمر للفشل)
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('جاري التحقق...');
    setIsError(false);

    try {
      // محاولة إرسال البيانات
      const response = await axios.post('https://backend-wsx0.onrender.com/login', formData);
      
      // إذا نجح الطلب (Status 200)
      setStatus(response.data.message);
      setIsError(false);
    } catch (error) {
      // إذا حدث خطأ (مثل 401 Unauthorized)
      if (error.response) {
        // هنا نستخرج الرسالة التي أرسلها السيرفر في الاحالة الثانية
        setStatus(error.response.data.message);
      } else {
        // في حال كان السيرفر متوقفاً تماماً
        setStatus('فشل الاتصال بالسيرفر');
      }
      setIsError(true);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>تسجيل الدخول</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          name="username"
          placeholder="اسم المستخدم"
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="كلمة المرور"
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <button type="submit" style={buttonStyle}>دخول</button>
      </form>

      {/* عرض الرسالة بتنسيق ملون بناءً على الحالة */}
      {status && (
        <p style={{ 
          marginTop: '15px', 
          color: isError ? 'red' : 'green', // أحمر للفشل، أخضر للنجاح
          fontWeight: 'bold' 
        }}>
          {status}
        </p>
      )}
    </div>
  );
}

// التنسيقات
const containerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' };
const formStyle = { display: 'flex', flexDirection: 'column', width: '300px' };
const inputStyle = { padding: '12px', margin: '8px 0', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'right' };
const buttonStyle = { padding: '12px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' };

export default App;
